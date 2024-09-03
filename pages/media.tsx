import IconX from '@/components/Icon/IconX';
import {
    Success,
    accessKeyId,
    addNewFile,
    deleteImagesFromS3,
    docFilter,
    fetchImagesFromS3,
    generatePresignedPost,
    generatePresignedVideoPost,
    generateUniqueFilename,
    getFileNameFromUrl,
    getFileType,
    imageFilter,
    months,
    objIsEmpty,
    secretAccessKey,
    separateFiles,
    showDeleteAlert,
    useSetState,
    videoFilter,
} from '@/utils/functions';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import CommonLoader from './elements/commonLoader';
import pdf from '../public/assets/images/pdf.png';
import docs from '../public/assets/images/docs.jpg';
import AWS from 'aws-sdk';
import Image from 'next/image';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_NEW_MEDIA_IMAGE, UPDATE_MEDIA_IMAGE, DELETE_MEDIA_IMAGE, GET_MEDIA_IMAGE } from '@/query/product';
import { Description } from '@headlessui/react/dist/components/description/description';
import IconLoader from '@/components/Icon/IconLoader';

export default function Media() {
    const longPressTimeout = useRef(null);

    const [addNewImages] = useMutation(ADD_NEW_MEDIA_IMAGE);
    const [updateImages, { loading: mediaUpdateLoading }] = useMutation(UPDATE_MEDIA_IMAGE);
    const [deleteImages] = useMutation(DELETE_MEDIA_IMAGE);
    const { data, refetch: getListRefetch } = useQuery(GET_MEDIA_IMAGE);

    const [state, setState] = useSetState({
        tab: 1,
        imageList: [],
        selectImg: null,
        date: 'all',
        selectedImages: [],
        copied: false,
        longPress: false,
        mediaType: 'all',
        loading: false,
        alt: '',
        title: '',
        caption: '',
        description: '',
        mediaData: null,
    });

    useEffect(() => {
        getMediaImage();
    }, []);

    useEffect(() => {
        filterByType();
    }, [state.mediaType]);

    const getMediaImage = async () => {
        try {
            setState({ loading: true });
            const res = await fetchImagesFromS3();
            if (state.mediaType == 'all') {
                setState({ imageList: res });
            } else if (state.mediaType == 'image') {
                const response = imageFilter(res);
                console.log("response: ", response);
                setState({ imageList: response });
            } else if (state.mediaType == 'video') {
                const response = videoFilter(res);
                setState({ imageList: response });
            } else {
                const response = docFilter(res);
                setState({ imageList: response });
            }
            setState({ loading: false });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleFileChange = async (e: any) => {
        try {
            setState({ loading: true });
            const res = await addNewFile(e);
            console.log("res: ", res);
            const fileType = await getFileType(res);
            const body = {
                fileUrl: res,
                title: '',
                alt: '',
                description: '',
                caption: '',
                fileType: fileType,
            };

            console.log("body: ", body);

            const response = await addNewImages({
                variables: {
                    input: body,
                },
            });
            console.log("response: ", response);

            getMediaImage();

            setState({ tab: 1 });
            Success('File added successfully');
            setState({ loading: false });
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const filterByType = async () => {
        const res = await fetchImagesFromS3(state.search);
        if (state.mediaType == 'all') {
            setState({ imageList: res });
        } else if (state.mediaType == 'image') {
            const response = imageFilter(res);
            console.log("response: ", response);
            setState({ imageList: response });
        } else if (state.mediaType == 'video') {
            const response = videoFilter(res);
            setState({ imageList: response });
        } else {
            const response = docFilter(res);
            setState({ imageList: response });
        }
    };

    const searchMediaByName = async (e) => {
        setState({ search: e });
        try {
            const res = await fetchImagesFromS3(e);
            if (state.mediaType == 'all') {
                setState({ imageList: res });
            } else if (state.mediaType == 'image') {
                const response = imageFilter(res);
                setState({ imageList: response });
            } else if (state.mediaType == 'video') {
                const response = videoFilter(res);
                setState({ imageList: response });
            } else {
                const response = docFilter(res);
                setState({ imageList: response });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(state.selectImg).then(() => {
            setState({ copied: true });
            setTimeout(() => setState({ copied: false }), 2000);
        });
    };
    const handleImageSelect = (item) => {
        setState((prevState) => ({
            ...prevState,
            selectedImages: prevState.selectedImages.includes(item) ? prevState.selectedImages.filter((image) => image !== item) : [...prevState.selectedImages, item],
        }));
    };

    const handleMouseDown = (item) => {
        longPressTimeout.current = setTimeout(() => {
            setState({ longPress: true });

            handleImageSelect(item);
        }, 500);
    };

    const handleMouseUp = () => {
        clearTimeout(longPressTimeout.current);
        setState({ longPress: false });
    };

    const handleMouseLeave = () => {
        clearTimeout(longPressTimeout.current);
        setState({ longPress: false });
    };

    const multiImageDelete = async () => {
        showDeleteAlert(deleteImage, () => {
            Swal.fire('Cancelled', 'Your Image List is safe :)', 'error');
        });
    };

    const deleteImage = async () => {
        try {
            const key = getFileNameFromUrl(state.selectImg);
            await deleteImagesFromS3(key);
            await deleteImages({ variables: { file_url: state.selectImg } });
            getMediaImage();
            setState({ selectImg: null });
            Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const filterMediaByMonth = async (value: any) => {
        if (value == 'all') {
            getMediaImage();
            setState({ date: value });
        } else {
            const [month, year] = value.split('/');
            const monthIndex = new Date(`${month} 1, 2024`).getMonth(); // To get the month index
            const res = await fetchImagesFromS3();
            const filteredImages = res.filter((item) => {
                const itemDate = new Date(item.LastModified);
                return itemDate.getFullYear() === parseInt(year) && itemDate.getMonth() === monthIndex;
            });
            if (state.mediaType == 'all') {
                setState({ imageList: filteredImages, date: value });
            } else if (state.mediaType == 'image') {
                const response = imageFilter(filteredImages);
                setState({ imageList: response, date: value });
            } else {
                const response = videoFilter(filteredImages);
                setState({ imageList: response, date: value });
            }
        }
    };

    // const handleClickImage = async (item) => {
    //     let url = `https://prade.blr1.digitaloceanspaces.com/${item.key}`;

    //     const fileType = await getFileType(url);
    //     const body = {
    //         fileUrl: url,
    //         title: '',
    //         alt: '',
    //         description: '',
    //         caption: '',
    //         fileType: fileType,
    //     };
    //     console.log('body: ', body);

    //     const response = await addNewImages({
    //         variables: {
    //             input: body,
    //         },
    //     });
    //     getMediaImage();
    // };

    const handleClickImage = async (item) => {
        let url = `https://prade.blr1.digitaloceanspaces.com/${item.key}`;

        const res = await getListRefetch({
            fileurl: url,
        });

        const result = res.data?.fileByFileurl;
        if (result) {
            setState({
                selectImg: result?.fileUrl,
                alt: result?.alt,
                title: result?.title,
                caption: result?.caption,
                description: result?.description,
                mediaData: { size: item.Size, lastModified: item.LastModified },
            });
        }
    };

    // const deletesImg = async (item) => {
    //     console.log("item: ", item);
    //     try {
    //         // const key = getFileNameFromUrl(state.selectImg);
    //         await deleteImagesFromS3(item.key);
    //         await deleteImages({ variables: { file_url: item.url } });
    //         getMediaImage();
    //         setState({ selectImg: null });
    //         Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
    //     } catch (error) {
    //         console.error('Error deleting file:', error);
    //     }
    // };

    const updateMetaData = async () => {
        try {
            const fileType = await getFileType(state.selectImg);
            const res = await updateImages({
                variables: {
                    file_url: state.selectImg,
                    input: {
                        fileUrl: state.selectImg,
                        fileType: fileType,
                        alt: state.alt,
                        description: state.description,
                        caption: state.caption,
                        title: state.title,
                    },
                },
            });
            Success('File updated successfully');

        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleUpload = async () => {
        try {
            const formData = new FormData();

            let fileMetadata = state.selectImg;
            const presignedPostData: any = await generatePresignedPost(state.selectImg);
            const response = await fetch(fileMetadata.url);
            const blob = await response.blob();
            const lastModifiedTimestamp = new Date(fileMetadata.LastModified).getTime();
            const file = new File([blob], fileMetadata.key, {
                type: getMimeType(fileMetadata.key),
                lastModified: lastModifiedTimestamp,
            });

            Object.keys(presignedPostData.fields).forEach((key) => {
                formData.append(key, presignedPostData.fields[key]);
            });
            formData.append('file', file);
            const responsedf = await axios.post(presignedPostData.url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            getMediaImage();
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const getMimeType = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const mimeTypes = {
            jpeg: 'image/jpeg',
            jpg: 'image/jpg',
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
            pdf: 'application/pdf',
            // Add more MIME types as needed
        };
        return mimeTypes[extension] || 'application/octet-stream'; // Default MIME type
    };

    const generatePresignedPost = (file) => {
        const spacesEndpoint = new AWS.Endpoint('https://prade.blr1.digitaloceanspaces.com');

        const s3 = new AWS.S3({
            endpoint: spacesEndpoint,
            accessKeyId: 'DO00MUC2HWP9YVLPXKXT', // Add your access key here
            secretAccessKey: 'W9N9b51nxVBvpS59Er9aB6Ht7xx2ZXMrbf3vjBBR8OA', // Add your secret key here
        });
        const params = {
            Bucket: 'prade', // Your Space name
            Fields: {
                key: file.key, // File name
                acl: 'public-read',
                'x-amz-meta-alt-text': state.alt, // Alternative Text metadata
                'x-amz-meta-title': state.title, // Title metadata
                'x-amz-meta-caption': state.caption, // Caption metadata
                'x-amz-meta-description': state.description, // Description metadata
            },
            Conditions: [
                ['content-length-range', 0, 1048576], // 1 MB limit
                ['starts-with', '$Content-Type', ''], // Allow any content type
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

    return (
        <div className=" ">
            <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Media</h5>
            </div>
            <div className="panel   w-full overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                <div className="m-5">
                    <div className="flex gap-5">
                        <button
                            onClick={() => {
                                setState({ tab: 0, search: '', date: 'all', mediaType: 'all' });
                                getMediaImage();
                            }}
                            className={`${state.tab == 0 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 text-lg before:inline-block`}
                        >
                            Upload Files
                        </button>
                        <button
                            onClick={() => {
                                setState({ tab: 1, search: '', date: 'all', mediaType: 'all' });

                                getMediaImage();
                            }}
                            className={`${state.tab == 1 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 text-lg before:inline-block`}
                        >
                            Media Library
                        </button>
                    </div>

                    {state.tab == 0 ? (
                        state.loading ? (
                            <CommonLoader />
                        ) : (
                            <div className="active  pt-5">
                                <div className="flex h-[500px] items-center justify-center">
                                    <div className="w-1/2 text-center">
                                        <h3 className="mb-2 text-xl font-semibold">Drag and drop files to upload</h3>
                                        <p className="mb-2 text-sm ">or</p>
                                        <input type="file" className="mb-2 ml-32" onChange={handleFileChange} />

                                        <p className="mb-2 text-sm">Maximum upload file size: 30 MB.</p>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <>
                            <div className="grid grid-cols-12 pt-5">
                                <div className="col-span-9  overflow-y-scroll border-r border-gray-200 pr-5">
                                    <div className="flex gap-4">
                                        <div>
                                            <div>Filter by type</div>
                                            <div className="flex justify-between gap-3 pt-3">
                                                <div className="flex gap-3">
                                                    {/* <select className="form-select w-40 flex-1"> */}
                                                    <select className="form-select w-60 flex-1" value={state.mediaType} onChange={(e) => setState({ mediaType: e.target.value })}>
                                                        <option value="all">All Data</option>
                                                        <option value="image">Images</option>
                                                        <option value="video">Videos</option>
                                                        <option value="doc">Docs</option>

                                                        {/* <option value="July/2024">July 2024</option>
                                                                            <option value="August/2024">August 2024</option> */}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div>Filter by month</div>

                                            <div className="flex justify-between gap-3 pt-3">
                                                <div className="flex gap-3">
                                                    <select className="form-select w-60 flex-1" value={state.date} onChange={(e) => filterMediaByMonth(e.target.value)}>
                                                        <option value="all">All Data</option>
                                                        {months.map((month, index) => (
                                                            <option key={month} value={`${month}/2024`}>{`${month} 2024`}</option>
                                                        ))}
                                                        {/* <option value="June/2024">June 2024</option>
                                                        <option value="July/2024">July 2024</option>
                                                        <option value="August/2024">August 2024</option> */}
                                                    </select>
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        className="form-input mr-2  w-80 "
                                                        placeholder="Search..."
                                                        value={state.search}
                                                        onChange={(e) => searchMediaByName(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-6 pt-5">
                                        {state.loading ? (
                                            <CommonLoader />
                                        ) : state.imageList?.length > 0 ? (
                                            state.imageList?.map((item) => (
                                                <div
                                                    key={item.url}
                                                    className={`flex h-[150px] w-[150px] overflow-hidden p-2 ${state.selectedImages.includes(item) ? 'border-4 border-blue-500' : ''}`}
                                                    onMouseDown={() => handleMouseDown(item)}
                                                    onMouseUp={handleMouseUp}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => {
                                                        handleClickImage(item);
                                                        // deletesImg(item)
                                                    }}
                                                >
                                                    {item?.key?.endsWith('.mp4') ? (
                                                        <video controls src={item.url} className="h-full w-full object-cover">
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    ) : item?.key?.endsWith('.pdf') ? (
                                                        <Image src={pdf} alt="Loading..." />
                                                    ) : item?.key?.endsWith('.doc') ? (
                                                        <Image src={docs} alt="Loading..." />
                                                    ) : (
                                                        <img src={item.url} alt="" className="h-full w-full" />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-6 flex h-64 items-center justify-center">No Data Found</div>
                                        )}
                                    </div>
                                </div>
                                {state.selectImg && (
                                    <div className="col-span-3  pl-5">
                                        {/* <div className="border-b border-gray-200 pb-5"> */}
                                        <div className="">
                                            <div>
                                                <p className="mb-2 text-lg font-semibold">ATTACHMENT DETAILS</p>
                                            </div>
                                            <div className="">
                                                {state.selectImg?.endsWith('.mp4') ? (
                                                    <video controls src={state.selectImg} className="">
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : state.selectImg?.endsWith('.pdf') ? (
                                                    <Image src={pdf} alt="Loading..." />
                                                ) : state.selectImg?.endsWith('.doc') ? (
                                                    <Image src={docs} alt="Loading..." />
                                                ) : (
                                                    <img src={state.selectImg} alt="" className="" />
                                                )}
                                                {/* <img src={state.selectImg?.url} alt="" className="" /> */}
                                            </div>
                                            <p className="mt-2 font-semibold">{state.selectImg?.key}</p>

                                            <p className="text-sm">{moment(state?.mediaData?.lastModified).format('DD-MM-YYYY')}</p>
                                            <p className="text-sm">{(state?.mediaData?.size / 1024).toFixed(2)} KB</p>

                                            <a href="#" className="text-danger underline" onClick={() => multiImageDelete()}>
                                                Delete permanently
                                            </a>
                                        </div>
                                        <div className="pr-5">
                                            <div className="mt-5">
                                                <label className="mb-2">Alt Text</label>
                                                <textarea className="form-input" placeholder="Enter Alt Text" value={state.alt} onChange={(e) => setState({ alt: e.target.value })}></textarea>
                                                <span>
                                                    <a href="#" className="text-primary underline">
                                                        Learn how to describe the purpose of the image
                                                    </a>
                                                    . Leave empty if the image is purely decorative.
                                                </span>
                                            </div>
                                            <div className="mt-5">
                                                <label className="mb-2">Title</label>
                                                <input type="text" value={state.title} onChange={(e) => setState({ title: e.target.value })} className="form-input" placeholder="Enter Title" />
                                            </div>

                                            <div className="mt-5">
                                                <label className="mb-2">Description</label>
                                                <textarea
                                                    className="form-input"
                                                    value={state.description}
                                                    onChange={(e) => setState({ description: e.target.value })}
                                                    placeholder="Enter Caption"
                                                ></textarea>
                                            </div>
                                            <div className="mt-5">
                                                <label className="mb-2">Caption</label>

                                                <textarea className="form-input" placeholder="Enter Alt Text" value={state.caption} onChange={(e) => setState({ caption: e.target.value })}></textarea>
                                            </div>

                                            <div className="mt-5">
                                                <label className="mb-2">File URL</label>
                                                <input type="text" className="form-input" placeholder="Enter Title" value={state.selectImg} />
                                                <button className="btn btn-primary-outline mt-2 text-sm" onClick={handleCopy}>
                                                    Copy URL to Clipboard
                                                </button>
                                                {state.copied ? <label className="mt-2 text-green-500">Copied</label> : <label className="mt-2">Copy Link</label>}
                                            </div>
                                            <div className="flex justify-end">
                                                <button type="submit" className="btn btn-primary " onClick={() => updateMetaData()}>
                                                    {mediaUpdateLoading ? <IconLoader /> : 'Update'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
