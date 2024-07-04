import React, { useState } from 'react';
import AWS from 'aws-sdk';

const spacesEndpoint = new AWS.Endpoint('https://prade.blr1.digitaloceanspaces.com'); 

const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: 'DO00MUC2HWP9YVLPXKXT',
    secretAccessKey: 'W9N9b51nxVBvpS59Er9aB6Ht7xx2ZXMrbf3vjBBR8OA',
});

const FileUpload = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        console.log('file: ', file);

        const params = {
            Bucket: 'prade', 
            Key: file.name, 
            Body: file,
            ACL: 'public-read', 
        };
        console.log('params: ', params);

        try {
            const data = await s3.upload(params).promise();
            console.log('File uploaded successfully', data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;
