const express = require('express');
const fs = require('fs');
const multer = require('multer');
const app = express();
const port = 5399;
const cors = require('cors')
app.use(cors({
    origin:'*'
}))

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('pdfFile'); // Assuming the file field is named 'pdfFile'

// Endpoint to handle file upload
app.post('/upload', upload, (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const fileName = file.originalname || `uploaded_file_${Date.now()}.pdf`; // Use provided name or generate a unique one

        // Write the Buffer data to a file using the provided filename
        fs.writeFile(`../frontend/public/pdfs/${fileName}`, file.buffer, (err) => {
            if (err) {
                console.log(`Uploaded file: ${fileName}`);
                return res.status(200).send('File uploaded successfully');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading file');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
