import React, { useState, useEffect } from 'react';
import { fetchImagesFromS3WithPagination } from '@/utils/functions';

const PAGE_LIMIT = 10;

export default function TestComponent() {
    const [images, setImages] = useState([]);
    const [displayedImages, setDisplayedImages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [continuationToken, setContinuationToken] = useState(null);
    const [isTruncated, setIsTruncated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchImages();
    }, [searchTerm]);

    const fetchImages = async (token = null) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchImagesFromS3WithPagination(searchTerm, PAGE_LIMIT, token);
            if (token === null) {
                // If token is null, it's the initial fetch or after search term change
                setImages(res.images);
                setDisplayedImages(res.images.slice(0, PAGE_LIMIT)); // Initialize displayed images
            } else {
                // If token is provided, append new images to the existing ones
                setImages((prevImages) => [...prevImages, ...res.images]);
                setDisplayedImages((prevDisplayedImages) => [
                    ...prevDisplayedImages,
                    ...res.images
                ]);
            }
            setContinuationToken(res.continuationToken);
            setIsTruncated(res.isTruncated);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleNext = () => {
        if (isTruncated) {
            fetchImages(continuationToken);
        }
    };

    const rows = [];
    for (let i = 0; i < displayedImages.length; i += 4) {
        rows.push(displayedImages.slice(i, i + 4));
    }

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search..."
            />
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <div>
                {displayedImages.length > 0 ? (
                    rows.map((row, rowIndex) => (
                        <div key={rowIndex} style={{ display: 'flex', marginBottom: '10px' }}>
                            {row.map((image) => (
                                <div key={image.key} style={{ marginRight: '10px' }}>
                                    <img src={image.url} alt={image.key} style={{ width: '100px', height: '100px' }} />
                                    <p>{image.key}</p>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>No images found.</p>
                )}
            </div>
           
            <button onClick={handleNext} disabled={!isTruncated}>
                Next
            </button>
        </div>
    );
}
