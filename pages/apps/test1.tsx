import IconX from '@/components/Icon/IconX';
import {
    Success,
    accessKeyId,
    addNewFile,
    addNewMediaFile,
    deleteImagesFromS3,
    docFilter,
    fetchImagesFromS3WithPagination,
    generatePresignedPost,
    generatePresignedVideoPost,
    generateUniqueFilename,
    getFileNameFromUrl,
    getFileType,
    getImageDimensions,
    getImageSizeInKB,
    getKey,
    getMonthNumber,
    imageFilter,
    months,
    objIsEmpty,
    resizeImage,
    resizingImage,
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
import CommonLoader from '../elements/commonLoader';
import pdf from '../../public/assets/images/pdf.png';
import docs from '../../public/assets/images/docs.jpg';
import AWS from 'aws-sdk';
import Image from 'next/image';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { ADD_NEW_MEDIA_IMAGE, UPDATE_MEDIA_IMAGE, DELETE_MEDIA_IMAGE, GET_MEDIA_IMAGE, MEDIA_PAGINATION } from '@/query/product';
import { Description } from '@headlessui/react/dist/components/description/description';
import IconLoader from '@/components/Icon/IconLoader';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';

export default function Media() {
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
        continuationToken: '',
        isTruncated: false,
        endCursor: false,
        startCursor: false,
        previousPage: '',
        hasNextPage: '',
        selectImageId: null,
        selectedMonthNumber: null,
        search: '',
    });

    const longPressTimeout = useRef(null);
    const PAGE_LIMIT = 10;
    const PAGE_SIZE = 24;

    const [addNewImages] = useMutation(ADD_NEW_MEDIA_IMAGE);
    const [updateImages, { loading: mediaUpdateLoading }] = useMutation(UPDATE_MEDIA_IMAGE);
    const [deleteImages] = useMutation(DELETE_MEDIA_IMAGE);
    const { data, refetch: getListRefetch, loading: loading } = useQuery(GET_MEDIA_IMAGE);

    const { refetch: mediaRefetch } = useQuery(MEDIA_PAGINATION);

    const {
        error,
        data: customerData,
        loading: getLoading,
    } = useQuery(MEDIA_PAGINATION, {
        variables: {
            first: PAGE_SIZE,
            after: null,
            fileType: state.mediaType == 'all' ? '' : state.mediaType,
            month: state.selectedMonthNumber,
            year: 2024,
            name: state.search,
        },
        onCompleted: (data) => {
            console.log('data: ', data);
            commonPagination(data);
        },
    });

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                first: PAGE_SIZE,
                after: state.endCursor,
                before: null,
            },
        });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                last: PAGE_SIZE,
                before: state.startCursor,
            },
        });
    };

    const [fetchNextPage] = useLazyQuery(MEDIA_PAGINATION, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(MEDIA_PAGINATION, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const commonPagination = (data) => {
        setState({
            imageList: data.files.edges,
            startCursor: data.files.pageInfo.startCursor,
            endCursor: data.files.pageInfo.endCursor,
            hasNextPage: data.files.pageInfo.hasNextPage,
            previousPage: data.files.pageInfo.hasPreviousPage,
        });
    };

    useEffect(() => {
        filterByType();
    }, [state.mediaType]);

    // useEffect(() => {
    //     fetchImages();
    // }, [state.search]);

    const getMediaImage = async () => {
        try {
            setState({ loading: true });
            const res = await fetchImagesFromS3WithPagination(state.search, pageLimit(), state.continuationToken);
            console.log('res: ', res.images);
            if (state.mediaType == 'all') {
                setState({ imageList: res.images });
            } else if (state.mediaType == 'image') {
                const response = imageFilter(res.images);
                console.log('response: ', response);
                setState({ imageList: response });
            } else if (state.mediaType == 'video') {
                const response = videoFilter(res.images);
                setState({ imageList: response });
            } else {
                const response = docFilter(res.images);
                setState({ imageList: response });
            }
            setState({ loading: false, continuationToken: res.continuationToken, isTruncated: res.isTruncated });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleFileChange = async (e: any) => {
        try {
            await addNewImage(e);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const generateUniqueFilenames = async (filename) => {
        let uniqueFilename = filename;
        let counter = 0;
        let fileExists = true;
    
        while (fileExists) {
            const res = await mediaRefetch({
                first: PAGE_LIMIT,
                after: null,
                fileType: '',
                month: null,
                year: null,
                name: uniqueFilename,
            });
    
            if (res?.data?.files?.edges?.length > 0) {
                counter += 1;
                const fileParts = filename.split('.');
                const extension = fileParts.pop();
                uniqueFilename = `${fileParts.join('.')}-${counter}.${extension}`;
            } else {
                fileExists = false;
            }
        }
    
        return uniqueFilename;
    };
    

    const addNewImage = async (e) => {
        let files = e.target.files[0];
        const unique = await generateUniqueFilenames(files.name);
            const result = await addNewMediaFile(files, unique);
            const fileType = await getFileType(result);
            const body = {
                fileUrl: result,
                title: '',
                alt: '',
                description: '',
                caption: '',
                fileType: fileType,
            };
            const response = await addNewImages({
                variables: {
                    input: body,
                },
            });
            setState({ tab: 1 });
            Success('File added successfully');
            setState({ loading: false });
    };

    const filterByType = async () => {
        fetchNextPage(commonInput(null, state.mediaType, state.selectedMonthNumber, state.search));
    };

    const searchMediaByName = async (e) => {
        setState({ search: e });
        try {
            if (e !== null && e !== '' && e !== undefined) {
                fetchNextPage(commonInput(null, state.mediaType, state.selectedMonthNumber, e));
            } else {
                fetchNextPage(commonInput(null, state.mediaType, state.selectedMonthNumber, ''));
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const commonInput = (after, fileType, month, name) => {
        const input = {
            variables: {
                first: PAGE_SIZE,
                after,
                fileType: fileType == 'all' ? '' : fileType,
                month,
                year: 2024,
                name,
            },
        };
        return input;
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
        setState({ date: value });
        const res = getMonthNumber(value);
        setState({ selectedMonthNumber: res ? res : null });

        fetchNextPage({
            variables: {
                first: PAGE_SIZE,
                after: null,
                fileType: state.mediaType == 'all' ? '' : state.mediaType,
                month: value == 'all' ? null : res,
                year: 2024,
                name: '',
            },
        });
    };

    const handleClickImage = async (item) => {
        console.log('item: ', item.node);
        const size = await getImageSizeInKB(item.node?.fileUrl);
        setState({
            selectImg: item.node?.fileUrl,
            alt: item.node?.alt,
            title: item.node?.title,
            caption: item.node?.caption,
            description: item.node?.description,
            mediaData: { size: `${size} KB`, lastModified: item.updatedAt, selectImageId: item.node?.id },
        });
    };

    const fetchImages = async (token = null) => {
        console.log('token: ', token);
        try {
            const res = await fetchImagesFromS3WithPagination(state.search, pageLimit(), token);
            if (token === null) {
                setState({ imageList: res.images });
            } else {
                setState({ imageList: [...state.imageList, ...res.images] });
            }
            setState({ continuationToken: res.continuationToken, isTruncated: res.isTruncated });
        } catch (err) {
        } finally {
            setState({ loading: false });
        }
    };

    const handleNext = async () => {
        if (state.isTruncated) {
            try {
                const res = await fetchImagesFromS3WithPagination(state.search, PAGE_LIMIT, state.continuationToken);
                if (state.continuationToken === null) {
                    setState({ imageList: res.images });
                } else {
                    setState({ imageList: [...state.imageList, ...res.images] });
                }
                setState({ continuationToken: res.continuationToken, isTruncated: res.isTruncated });
            } catch (err) {
            } finally {
                setState({ loading: false });
            }
        }
    };

    const updateMetaData = async () => {
        try {
            const fileType = await getFileType(state.selectImg);
            const res = await updateImages({
                variables: {
                    file_url: state.selectImg,
                    id: state.selectImageId,
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

    const pageLimit = () => {
        let limit = 10;
        if (state.imageList?.length > 10) {
            limit = state.imageList?.length;
        }
        return limit;
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
                                // getMediaImage();
                            }}
                            className={`${state.tab == 0 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 text-lg before:inline-block`}
                        >
                            Upload Files
                        </button>
                        <button
                            onClick={() => {
                                setState({ tab: 1, search: '', date: 'all', mediaType: 'all' });

                                // getMediaImage();
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
                                                        <option value="Image">Images</option>
                                                        <option value="Video">Videos</option>
                                                        <option value="Doc">Docs</option>

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
                                                    <select
                                                        className="form-select w-60 flex-1"
                                                        value={state.date}
                                                        onChange={(e) => {
                                                            filterMediaByMonth(e.target.value);
                                                        }}
                                                    >
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

                                    <div className=" ">
                                        {getLoading || loading ? (
                                            <CommonLoader />
                                        ) : (
                                            <div className="grid grid-cols-6 pt-5 ">
                                                {state.imageList?.length > 0 ? (
                                                    state.imageList?.map((item) => {
                                                        return (
                                                            <div
                                                                key={item.node?.fileUrl}
                                                                className={`flex h-[150px] w-[150px] overflow-hidden p-2 ${state.selectedImages.includes(item) ? 'border-4 border-blue-500' : ''}`}
                                                                onMouseDown={() => handleMouseDown(item)}
                                                                onMouseUp={handleMouseUp}
                                                                onMouseLeave={handleMouseLeave}
                                                                onClick={() => {
                                                                    handleClickImage(item);
                                                                    // deletesImg(item)
                                                                }}
                                                            >
                                                                {item?.node?.key?.endsWith('.mp4') ? (
                                                                    <video controls src={item.node?.fileUrl} className="h-full w-full object-cover">
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                ) : item?.node?.key?.endsWith('.pdf') ? (
                                                                    <Image src={pdf} alt="Loading..." />
                                                                ) : item?.node?.key?.endsWith('.doc') ? (
                                                                    <Image src={docs} alt="Loading..." />
                                                                ) : (
                                                                    <img src={item.node?.fileUrl} alt="" className="h-full w-full" />
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="col-span-6 flex h-64 items-center justify-center">No Data Found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-5 flex justify-end gap-3">
                                        <button disabled={!state.previousPage} onClick={handlePreviousPage} className={`btn ${!state.previousPage ? 'btn-disabled' : 'btn-primary'}`}>
                                            <IconArrowBackward />
                                        </button>
                                        <button disabled={!state.hasNextPage} onClick={handleNextPage} className={`btn ${!state.hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                                            <IconArrowForward />
                                        </button>
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
                                                <img src={state.selectImg?.url} alt="" className="" />
                                            </div>
                                            <p className="mt-2 font-semibold">{getKey(state.selectImg)}</p>

                                            <p className="text-sm">{moment(state?.mediaData?.lastModified).format('DD-MM-YYYY')}</p>
                                            <p className="text-sm">{state?.mediaData?.size}</p>

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
