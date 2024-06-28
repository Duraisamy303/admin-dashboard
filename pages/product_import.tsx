import React, { useState, useRef } from 'react';
import IconLoader from '@/components/Icon/IconLoader';
import axios from 'axios';
import { Failure, Success, useSetState } from '@/utils/functions';
import { error } from 'console';
import { useRouter } from 'next/router';

export default function ProductImport() {
    const router = useRouter();

    const [state, setState] = useSetState({
        loading: false,
        file: null,
        updateProducts: false,
        errors: [],
    });

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'text/csv' && file.size <= 30 * 1024 * 1024) {
            setState({ file });
        } else {
            alert('Please upload a CSV file with a maximum size of 30MB');
        }
    };

    const uploadProducts = async () => {
        if (!state.file) {
            Failure('Please select a CSV file to upload');
            return;
        }

        setState({ loading: true });
        console.log('state.file: ', state.file);

        try {
            const token = localStorage.getItem('token');

            let formData = new FormData();
            formData.append('update_products', state.updateProducts ? 'update_products' : '');
            formData.append('excel', state.file);
            console.log('formData: ', formData);

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://file.prade.in/import_data1/',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: 'JWT ' + token,
                },
                data: formData,
            };

            const response = await axios.request(config);
            console.log('Response: ', JSON.stringify(response.data));
            if (response.data.errors && response.data.errors.length > 0) {
                setState({ errors: response.data.errors });
            } else {
                Success('File uploaded successfully');
                setState({ errors: [], file: null, updateProducts: false });
                fileInputRef.current.value = ''; // Clear the file input
            }
        } catch (error) {
            console.error('Error: ', error);
            Failure('File upload failed');
        } finally {
            setState({ loading: false });
        }
    };

    return (
        <div>
            <div className="panel mb-5 flex items-center justify-between gap-3 p-5 ">
                <h3 className="text-lg font-semibold dark:text-white-light">Import Products</h3>
            </div>
            <div className="flex w-full items-center justify-center text-center">
                <div className="panel w-full p-4 text-center">
                    <div className="">
                        <input
                            type="file"
                            className="rtl:file-ml-5 form-input p-0 file:border-0 file:bg-primary/90 file:px-4 file:py-2 file:font-semibold file:text-white file:hover:bg-primary ltr:file:mr-5"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={state.updateProducts}
                            onChange={(e) => setState({ updateProducts: e.target.checked })}
                            className="form-checkbox border-white-light dark:border-white-dark ltr:mr-0 rtl:ml-0"
                        />
                        <h3 className="text-md font-semibold dark:text-white-light">Update Products</h3>
                    </div>
                    <div className="mt-5 flex gap-5">
                        <div className="">
                            {state.loading ? (
                                <button type="button" className="btn btn-primary">
                                    <IconLoader className="inline-block shrink-0 animate-[spin_2s_linear_infinite] align-middle ltr:mr-2 rtl:ml-2" />
                                    Loading
                                </button>
                            ) : (
                                <button type="button" className="btn btn-primary" onClick={uploadProducts}>
                                    Upload
                                </button>
                            )}
                        </div>
                        <div className="">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    fileInputRef.current.value = '';
                                    setState({ errors: {}, updateProducts: false, file: null });
                                }}
                            >
                                Reset
                            </button>
                        </div>
                        <div className="">
                            <button type="button" className="btn btn-primary" onClick={() => router.push('/')}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {state.errors.length > 0 && (
                <div className="mt-5 text-red-500">
                    <h4 className="text-lg font-semibold">Upload Errors :</h4>
                    <ul className="list-inside list-disc">
                        {state.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
