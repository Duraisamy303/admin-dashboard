import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AWS from 'aws-sdk';
import { fetchImagesFromS3 } from '@/utils/functions';

const FileUpload = () => {
    const spacesEndpoint = new AWS.Endpoint('https://prade.blr1.digitaloceanspaces.com');

    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: 'DO00MUC2HWP9YVLPXKXT', // Add your access key here
        secretAccessKey: 'W9N9b51nxVBvpS59Er9aB6Ht7xx2ZXMrbf3vjBBR8OA', // Add your secret key here
    });

    const generatePresignedPost = (file, metadata) => {
        const params = {
            Bucket: 'prade', // Your Space name
            Fields: {
                key: file.name, // File name
                acl: 'public-read',
                'x-amz-meta-alt-text': metadata.altText, // Alternative Text metadata
                'x-amz-meta-title': metadata.title, // Title metadata
                'x-amz-meta-caption': metadata.caption, // Caption metadata
                'x-amz-meta-description': metadata.description, // Description metadata
            },
            Conditions: [
                ['content-length-range', 0, 1048576], // 1 MB limit
                ['starts-with', '$Content-Type', ''], // Allow any content type
                // ['eq', '$x-amz-meta-alt-text', metadata.altText], // Validate Alternative Text
                // ['eq', '$x-amz-meta-title', metadata.title], // Validate Title
                // ['eq', '$x-amz-meta-caption', metadata.caption], // Validate Caption
                // ['eq', '$x-amz-meta-description', metadata.description], // Validate Description
            ],
            Expires: 60, // 1 minute expiration
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
    const [metadata, setMetadata] = useState({
        altText: '',
        title: '',
        caption: '',
        description: '',
    });

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleMetaChange = (key, value) => {
        setMetadata({
            ...metadata,
            [key]: value,
        });
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleUpload = async () => {
        if (!file) return;

        try {
            const presignedPostData: any = await generatePresignedPost(file, metadata);

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
            fetchImages();
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const fetchImages = async () => {
        try {
            const res = await fetchImagesFromS3();
            console.log('res: ', res);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const fetchImagesFromS3 = async (searchTerm = '') => {
        const spacesEndpoint = new AWS.Endpoint('https://blr1.digitaloceanspaces.com');
        const s3 = new AWS.S3({
            endpoint: spacesEndpoint,
            accessKeyId: 'DO00MUC2HWP9YVLPXKXT', // Add your access key here
            secretAccessKey: 'W9N9b51nxVBvpS59Er9aB6Ht7xx2ZXMrbf3vjBBR8OA', // Add your secret key here
        });

        const params = {
            Bucket: 'prade', // Your Space name
            Prefix: searchTerm,
        };

        try {
            const data = await s3.listObjectsV2(params).promise();
            console.log('data: ', data);

            // Fetch metadata for each object
            const metadataPromises = data.Contents.map(async (item) => {
                try {
                    const metadata = await s3
                        .headObject({
                            Bucket: 'prade',
                            Key: item.Key,
                        })
                        .promise();

                    return {
                        url: `https://prade.blr1.cdn.digitaloceanspaces.com/${item.Key}`,
                        key: item.Key,
                        LastModified: item.LastModified,
                        metadata: metadata.Metadata || {}, // Ensure Metadata is accessed
                        ...item,
                    };
                } catch (error) {
                    console.error(`Error fetching metadata for ${item.Key}:`, error);
                    return {
                        url: `https://prade.blr1.cdn.digitaloceanspaces.com/${item.Key}`,
                        key: item.Key,
                        LastModified: item.LastModified,
                        Metadata: {}, // Default to empty object if metadata fetch fails
                        ...item,
                    };
                }
            });

            // Wait for all metadata promises to resolve
            const imageUrls = await Promise.all(metadataPromises);
            console.log('imageUrls: ', imageUrls);

            // Sort images by LastModified date
            return imageUrls.sort((a, b) => b.LastModified - a.LastModified);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <br />
            <input type="text" placeholder="Alternative Text" value={metadata.altText} onChange={(e) => handleMetaChange('altText', e.target.value)} />
            <br />
            <input type="text" placeholder="Title" value={metadata.title} onChange={(e) => handleMetaChange('title', e.target.value)} />
            <br />
            <input type="text" placeholder="Caption" value={metadata.caption} onChange={(e) => handleMetaChange('caption', e.target.value)} />
            <br />
            <input type="text" placeholder="Description" value={metadata.description} onChange={(e) => handleMetaChange('description', e.target.value)} />
            <br />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;
