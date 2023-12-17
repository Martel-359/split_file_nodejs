import multer from 'multer';
import fse from 'fs-extra';
import fs, { read } from 'fs';
import textract from 'textract';
import Docxtemplater from 'docxtemplater';
import path from 'path';
import PizZip from 'pizzip';
import 'dotenv/config.js';




const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('file');

/**
 * Splits a file into multiple chunks and saves each chunk as a separate document.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<Object>} - A promise that resolves to the response object.
 */
const splitFile = async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            console.log('Multer Error:', err);
            return res.status(500).json({ error: 'Error uploading file' });
        } else if (err) {
            console.log('Unknown Error:', err);
            return res.status(500).json({ error: 'Error uploading file' });
        }

        const fileBuffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        const numchar = req.body.numchar;
        const namefile = req.file.originalname;



        let readFile = new Promise(function (resolve, reject) {
            textract.fromBufferWithMime(mimetype, fileBuffer, function (error, text) {
                if (error) {
                    reject(error);
                }
                resolve(text.toString());
            });

        })

        readFile.then(
            function (data) {
                const dataString = data;// save data
                let numSplit = Math.ceil(data.length / numchar); // number of split file
                let point = 0;
                let generatedDoc;
                let PathStoreLocal=process.env.PATH_STORE_LOCAL; // path save file .env
                for (let i = 0; i < numSplit; i++) {
                    let doc = new Docxtemplater();
                    let templateString = fs.readFileSync('src/output/temp.docx', 'binary');
                    doc.loadZip(new PizZip(templateString, { base64: false }));
                    let start = point;
                    let end = (i + 1) * numchar;
                    let output = `${PathStoreLocal}${i}-${namefile}`;
                    console.log(output);
                    //find exactly end position
                    while (dataString[end] != ' ') {
                        end--;
                    }

                    point = end; //Set start position for after loop
                    // cut dataString
                    let stringSplit = dataString.slice(start, end).trim();
                    // render new document
                    try {
                        doc.render(
                            {
                                context: stringSplit
                            }
                        );
                    } catch (renderError) {
                        console.error('Error rendering document:', renderError);
                        return res.status(500).json({ error: 'Error splitting file' });
                    }

                    // Save the generated document
                    generatedDoc = doc.getZip().generate({ type: 'nodebuffer' });
                    fs.writeFileSync(output, generatedDoc);
                }
                console.log('Received File:', req.file);
                return res.status(200).json({ message: 'File split successfully' });
            },
            function (err) {
                console.log('Error:', err);
            }
        )
    });
};

export default { splitFile };
