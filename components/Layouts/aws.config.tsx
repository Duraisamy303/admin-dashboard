import React, { useState } from 'react';
import axios from 'axios';
import AWS from 'aws-sdk';
const FileUpload = () => {
    const spacesEndpoint = new AWS.Endpoint('https://prade.blr1.digitaloceanspaces.com');

    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: 'DO00MUC2HWP9YVLPXKXT', // Add your access key here
        secretAccessKey: 'W9N9b51nxVBvpS59Er9aB6Ht7xx2ZXMrbf3vjBBR8OA', // Add your secret key here
    });

    const generatePresignedPost = (file) => {
        const params = {
            Bucket: 'prade', // Your Space name
            Fields: {
                key: file.name, // File name
                acl: 'public-read',
            },
            Conditions: [
                ['content-length-range', 0, 1048576], // 1 MB limit
                ['starts-with', '$Content-Type', ''], // Allow any content type
            ],
            Expires: 60,
        };

        return new Promise((resolve, reject) => {
            s3.createPresignedPost(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            const presignedPostData:any = await generatePresignedPost(file);

            const formData = new FormData();
            Object.keys(presignedPostData.fields).forEach((key) => {
                formData.append(key, presignedPostData.fields[key]);
            });
            formData.append('file', file);

            const response = await axios.post(presignedPostData.url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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
