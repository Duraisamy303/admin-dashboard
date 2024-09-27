import React, { useEffect, useState, Fragment, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import Select from 'react-select';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';

import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import * as Yup from 'yup';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
    ADD_NEW_MEDIA_IMAGE,
    CATEGORY_DETAILS,
    CATEGORY_LIST,
    CREATE_CATEGORY,
    DELETE_CATEGORY,
    DELETE_MEDIA_IMAGE,
    GET_MEDIA_IMAGE,
    MEDIA_PAGINATION,
    PRODUCT_LIST,
    UPDATE_CATEGORY,
    UPDATE_CATEGORY_NEW,
    UPDATE_MEDIA_IMAGE,
} from '@/query/product';
import { PARENT_CATEGORY_LIST } from '@/query/product';
import IconLoader from '@/components/Icon/IconLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import {
    Failure,
    Success,
    addNewFile,
    addNewMediaFile,
    categoryImageUpload,
    deleteImagesFromS3,
    fetchImagesFromS3,
    filterImages,
    formatOptions,
    generatePresignedPost,
    getFileNameFromUrl,
    getFileType,
    getImageDimensions,
    getKey,
    getMonthNumber,
    months,
    objIsEmpty,
    profilePic,
    resizeImage,
    resizingImage,
    showDeleteAlert,
} from '@/utils/functions';
import { useRouter } from 'next/router';
import axios from 'axios';
import moment from 'moment';
import CommonLoader from '../elements/commonLoader';
import Swal from 'sweetalert2';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';

const EditCategory = () => {
    const router = useRouter();

    const PAGE_SIZE = 24;

    const catId = router?.query?.id;

    const dispatch = useDispatch();

    const [parentLists, setParentLists] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [copied, setCopied] = useState(false);
    const [mediaSearch, setMediaSearch] = useState('');
    const [mediaOpen, setMediaOpen] = useState(false);
    const [mediaImages, setMediaImages] = useState([]);
    const [selectedImg, setSelectedImg] = useState(null);
    const [mediaTab, setMediaTab] = useState(0);
    const [mediaDate, setMediaDate] = useState('all');
    const [catData, setCatData] = useState(null);
    const [name, setName] = useState('');
    const [menuOrder, setMenuOrder] = useState(null);
    const [selectedCat, setSelectedCat] = useState(null);
    const [mediaMonth, setMediaMonth] = useState('all');
    const [description, setDescription] = useState('');
    const [loadings, setLoading] = useState(false);
    const [alt, setAlt] = useState('');
    const [caption, setCaption] = useState('');
    const [mediaData, setMediaData] = useState(null);
    const [title, setTitle] = useState('');
    const [mediaDescription, setMediaDescription] = useState('');
    const [mediaStartCussor, setMediaStartCussor] = useState('');
    const [mediaEndCursor, setMediaEndCursor] = useState('');
    const [mediaHasNextPage, setMediaHasNextPage] = useState(false);
    const [mediaPreviousPage, setMediaPreviousPage] = useState(false);
    const [monthNumber, setMonthNumber] = useState(null);

    useEffect(() => {
        dispatch(setPageTitle('Category'));
    });

    const { error, data: categoryData } = useQuery(CATEGORY_LIST, {
        variables: { channel: 'india-channel', first: 100 },
    });

    const { data: categoryDatas } = useQuery(CATEGORY_DETAILS, {
        variables: { id: catId },
    });

    const { data: parentList } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    const { refetch: mediaRefetch } = useQuery(MEDIA_PAGINATION);

    const [updateCategory, { loading }] = useMutation(UPDATE_CATEGORY_NEW);

    const [addNewImages] = useMutation(ADD_NEW_MEDIA_IMAGE);

    const [updateImages, { loading: mediaUpdateLoading }] = useMutation(UPDATE_MEDIA_IMAGE);

    const [deleteImages] = useMutation(DELETE_MEDIA_IMAGE);

    const { data, refetch: getListRefetch } = useQuery(GET_MEDIA_IMAGE);

    const { data: customerData, loading: getLoading } = useQuery(MEDIA_PAGINATION, {
        variables: {
            first: PAGE_SIZE,
            after: null,
            fileType: 'Image',
            month: null,
            year: 2024,
            name: '',
        },
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const commonPagination = (data) => {
        setMediaImages(data.files.edges);
        setMediaStartCussor(data.files.pageInfo.startCursor);
        setMediaEndCursor(data.files.pageInfo.endCursor);
        setMediaHasNextPage(data.files.pageInfo.hasNextPage);
        setMediaPreviousPage(data.files.pageInfo.hasPreviousPage);
    };

    useEffect(() => {
        getDetails();
    }, [categoryDatas, catId]);

    useEffect(() => {
        filterByType();
    }, [monthNumber]);

    useEffect(() => {
        const getparentCategoryList = parentList?.categories?.edges;
        const options = formatOptions(getparentCategoryList);
        setParentLists(options);
    }, [parentList]);

    const getDetails = async () => {
        try {
            const find = categoryDatas?.category;
            setCatData(find);
            setName(find?.name);
            if (find?.description) {
                const jsonObject = JSON.parse(find?.description);
                const textValue = jsonObject?.blocks[0]?.data?.text;
                setDescription(textValue);
            } else {
                setDescription('');
            }
            setPreviewUrl(find?.backgroundImageUrl);
            setSelectedCat({ value: find?.parent?.id, label: find?.parent?.name });
            setMenuOrder(find?.menuOrder);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    // form submit
    const onSubmit = async () => {
        try {
            if (name == '') {
                Failure('Please fill the Category Name');
                return;
            }
            const Description = JSON.stringify({ time: Date.now(), blocks: [{ id: 'some-id', data: { text: description }, type: 'paragraph' }], version: '2.24.3' });

            const variables = {
                input: {
                    name: name,
                    description: Description,
                    backgroundImageUrl: previewUrl ? previewUrl : '',
                    menuOrder: menuOrder,
                },
                id: catId,
                parent: selectedCat ? selectedCat?.value : '',
            };

            const { data } = await updateCategory({ variables });
            if (data?.categoryUpdate?.errors?.length > 0) {
                Failure(data?.categoryUpdate?.errors[0].message);
            } else {
                router.replace('/product/category');
                Success('Category updated successfully');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const searchMediaByName = async (e) => {
        setMediaSearch(e);
        try {
            if (e !== null && e !== '' && e !== undefined) {
                fetchNextPage(commonInput(null, monthNumber, e));
            } else {
                fetchNextPage(commonInput(null, monthNumber, ''));
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(selectedImg).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
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
                first: PAGE_SIZE,
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
        console.log('files: ', files);
        const isImage = files.type.startsWith('image/');
        if (isImage) {
            if (files.size > 300 * 1024) {
                files = await resizingImage(files);
                files = await resizeImage(files, 1160, 1340);
            } else {
                files = await resizeImage(files, 1160, 1340);
            }
            const { width, height } = await getImageDimensions(files);
        }

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
        const bodys = {
            node: {
                fileUrl: response.data?.fileCreate?.file?.fileUrl,
            },
        };
        handleClickImage(bodys);

        const res = await mediaRefetch({
            first: PAGE_SIZE,
            after: null,
            fileType: '',
            month: null,
            year: null,
            name: '',
        });

        commonPagination(res.data);
        setMediaTab(1);
        Success('File added successfully');
    };

    const handleClickImage = async (item) => {
        const res = await getListRefetch({
            fileurl: item.node.fileUrl,
        });

        const result = res.data?.fileByFileurl;
        if (result) {
            setSelectedImg(result?.fileUrl);
            setAlt(result?.alt);
            setTitle(result?.title);
            setDescription(result?.description);
            setCaption(result?.caption);
            setMediaData({ size: `${parseFloat(result?.size)?.toFixed(2)}`, lastModified: item.LastModified });
        }
    };

    const updateMediaMetaData = async () => {
        try {
            const fileType = await getFileType(selectedImg);

            const res = await updateImages({
                variables: {
                    file_url: selectedImg,
                    input: {
                        fileUrl: selectedImg,
                        fileType: fileType,
                        alt: alt,
                        description: mediaDescription,
                        caption: caption,
                        title: title,
                    },
                },
            });
            Success('File updated successfully');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const mediaImageDelete = async () => {
        showDeleteAlert(deleteImage, () => {
            Swal.fire('Cancelled', 'Your Image List is safe :)', 'error');
        });
    };

    const deleteImage = async () => {
        try {
            const key = getFileNameFromUrl(selectedImg);
            await deleteImagesFromS3(key);
            await deleteImages({ variables: { file_url: selectedImg } });
            const res = await mediaRefetch({
                first: PAGE_SIZE,
                after: null,
                fileType: '',
                month: null,
                year: null,
                name: '',
            });

            commonPagination(res.data);
            setSelectedImg(null);
            Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const filterByType = async () => {
        fetchNextPage(commonInput(null, monthNumber, mediaSearch));
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

    const commonInput = (after, month, name) => {
        const input = {
            variables: {
                first: PAGE_SIZE,
                after,
                fileType: 'Image',
                month: month,
                year: 2024,
                name,
            },
        };
        return input;
    };

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                first: PAGE_SIZE,
                after: mediaEndCursor,
                before: null,
                fileType: 'Image',
                month: monthNumber,
                year: 2024,
                name: mediaSearch,
            },
        });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                last: PAGE_SIZE,
                before: mediaStartCussor,
                fileType: 'Image',
                month: monthNumber,
                year: 2024,
                name: mediaSearch,
            },
        });
    };

    return (
        <div>
            <div className="mt-6">
                <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Update Category</h5>
                </div>
                <div className="mb-5 p-5">
                    <div>
                        <label>Name </label>
                        <input value={name} onChange={(e) => setName(e.target.value)} name="name" type="text" id="fullName" placeholder="Enter Name" className="form-input" />
                    </div>

                    <div className="mt-5">
                        <label htmlFor="description mt-4">Description </label>
                        <textarea className="form-textarea" style={{ height: '100px' }} placeholder="Enter Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    </div>

                    <div className="mt-5">
                        <label>Menu Order </label>
                        <input
                            value={menuOrder}
                            onChange={(e) => {
                                const value = e.target.value;
                                setMenuOrder(value === '' ? null : value);
                            }}
                            name="name"
                            type="number"
                            id="fullName"
                            placeholder="Enter Menu Order"
                            className="form-input"
                        />
                    </div>

                    <div className="mb-5 mt-5">
                        <label htmlFor="description">Image </label>
                        {previewUrl ? (
                            <div className="relative flex items-center justify-around">
                                <img src={previewUrl} alt="Selected" style={{ marginTop: '10px', maxHeight: '200px' }} />
                                <div
                                    className="absolute cursor-pointer rounded-full bg-red-500 p-1 text-white"
                                    onClick={() => {
                                        setPreviewUrl(null);
                                    }}
                                >
                                    <IconTrashLines />
                                </div>
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={() => {
                                    setMediaTab(1);
                                    setMediaOpen(true);
                                }}
                            >
                                upload
                            </button>
                        )}
                    </div>
                    <div>
                        <label>Parent Category</label>
                        <Select value={selectedCat} onChange={(e) => setSelectedCat(e)} options={parentLists} placeholder="Select categories..." className="form-select" />
                    </div>

                    <button type="button" className="btn btn-primary !mt-6" onClick={() => onSubmit()}>
                        {loading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                    </button>
                </div>
            </div>

            <Transition appear show={mediaOpen} as={Fragment}>
                <Dialog
                    as="div"
                    open={mediaOpen}
                    onClose={() => {
                        setSelectedImg(null);
                        setMediaOpen(false);
                    }}
                >
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel max-w-8xl my-8 w-full overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <h5 className="text-lg font-bold">Media</h5>
                                        <button
                                            onClick={() => {
                                                setMediaOpen(false);
                                            }}
                                            type="button"
                                            className="text-white-dark hover:text-dark"
                                        >
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="m-5">
                                        <div className="flex justify-between">
                                        <div className="flex gap-5">
                                            <button
                                                onClick={() => {
                                                    setMediaTab(0);
                                                    setMediaMonth('all'), setMediaSearch('');
                                                }}
                                                className={`${mediaTab == 0 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 before:inline-block `}
                                            >
                                                Upload Files
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMediaTab(1);
                                                    setMediaMonth('all'), setMediaSearch('');
                                                }}
                                                className={`${mediaTab == 1 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 before:inline-block `}
                                            >
                                                Media Library
                                            </button>
                                        </div>

                                            <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() => {
                                                            if (selectedImg == null) {
                                                                Failure('Please select an image');
                                                            } else {
                                                                setPreviewUrl(selectedImg);
                                                                setMediaOpen(false);
                                                                setSelectedImg(null);
                                                            }
                                                        }}
                                                    >
                                                        Set Product Image
                                                    </button>
                                        </div>

                                        {mediaTab == 0 ? (
                                            loadings ? (
                                                <CommonLoader />
                                            ) : (
                                                <div className="active  pt-5">
                                                    <div className="flex h-[500px] items-center justify-center">
                                                        <div className="w-1/2 text-center">
                                                            <h3 className="mb-2 text-xl font-semibold">Drag and drop files to upload</h3>
                                                            <p className="mb-2 text-sm ">or</p>
                                                            {/* <input type="file" className="mb-2 ml-32" /> */}
                                                            <input type="file" className="mb-2 ml-32" onChange={handleFileChange} />

                                                            <p className="mb-2 text-sm">Maximum upload file size: 30 MB.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ) : loadings ? (
                                            <CommonLoader />
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-12 pt-5">
                                                    <div className="col-span-9 h-[450px] overflow-y-scroll border-r border-gray-200 pr-5">
                                                        <div>
                                                            <div>Filter by month</div>
                                                        </div>
                                                        <div className="flex justify-between gap-3 pt-3">
                                                            <div className="flex gap-3">
                                                                <select
                                                                    className="form-select w-60 flex-1"
                                                                    value={mediaMonth}
                                                                    onChange={(e) => {
                                                                        const res = getMonthNumber(e.target.value);
                                                                        setMonthNumber(res);
                                                                        setMediaMonth(e.target.value);
                                                                    }}
                                                                >
                                                                    <option value="all">All Data</option>
                                                                    {months.map((month, index) => (
                                                                        <option key={month} value={`${month}/2024`}>{`${month} 2024`}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    className="form-input mr-2 w-auto"
                                                                    placeholder="Search..."
                                                                    value={mediaSearch}
                                                                    onChange={(e) => searchMediaByName(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-6 gap-3 pt-5">
                                                            {mediaImages?.length > 0 ? (
                                                                mediaImages?.map((item) => (
                                                                    <div
                                                                        key={item?.node?.fileUrl}
                                                                        className={`flex h-[200px] w-[170px] overflow-hidden p-2  ${
                                                                            selectedImg == item?.node?.fileUrl ? 'border-4 border-blue-500' : ''
                                                                        }`}
                                                                        // onMouseDown={() => handleMouseDown(item)}
                                                                        // onMouseUp={handleMouseUp}
                                                                        // onMouseLeave={handleMouseLeave}
                                                                        onClick={() => handleClickImage(item)}
                                                                    >
                                                                        {item?.node?.fileUrl.endsWith('.mp4') ? (
                                                                            <video controls src={item?.node?.fileUrl} className="h-full w-full object-cover">
                                                                                Your browser does not support the video tag.
                                                                            </video>
                                                                        ) : (
                                                                            <img src={item?.node?.fileUrl} alt="" className="h-full w-full" />
                                                                        )}
                                                                        {/* <img src={item.url} alt="" className="h-full w-full object-cover" /> */}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="col-span-6 flex h-64 items-center justify-center">No Data Found</div>
                                                            )}
                                                        </div>
                                                        <div className="mt-5 flex justify-end gap-3">
                                                            <button disabled={!mediaPreviousPage} onClick={handlePreviousPage} className={`btn ${!mediaPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                                                                <IconArrowBackward />
                                                            </button>
                                                            <button disabled={!mediaHasNextPage} onClick={handleNextPage} className={`btn ${!mediaHasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                                                                <IconArrowForward />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {selectedImg && (
                                                        <div className="col-span-3 h-[450px] overflow-y-scroll pl-5">
                                                            {/* <div className="border-b border-gray-200 pb-5"> */}
                                                            <div className="">
                                                                <div>
                                                                    <p className="mb-2 text-lg font-semibold">ATTACHMENT DETAILS</p>
                                                                </div>
                                                                {selectedImg?.endsWith('.mp4') ? (
                                                                    <video controls src={selectedImg} className="h-full w-full object-cover" style={{ height: '300px' }}>
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                ) : (
                                                                    <img src={selectedImg} alt="" className="h-full w-full" />
                                                                )}

                                                                {/* <p className="mt-2 font-semibold">{selectedImg}</p> */}
                                                                <p className="mt-2 font-semibold">{getKey(selectedImg)}</p>

                                                                <p className="text-sm">{moment(mediaData?.lastModified).format('DD-MM-YYYY')}</p>
                                                                <p className="text-sm">{mediaData?.size} KB</p>

                                                                {/* <p className="text-sm">1707 by 2560 pixels</p> */}
                                                                <a href="#" className="text-danger underline" onClick={() => mediaImageDelete()}>
                                                                    Delete permanently
                                                                </a>
                                                            </div>
                                                            <div className="pr-5">
                                                                <div className="mt-5">
                                                                    <label className="mb-2">Alt Text</label>
                                                                    <textarea className="form-input" placeholder="Enter Alt Text" value={alt} onChange={(e) => setAlt(e.target.value)}></textarea>
                                                                    <span>
                                                                        <a href="#" className="text-primary underline">
                                                                            Learn how to describe the purpose of the image
                                                                        </a>
                                                                        . Leave empty if the image is purely decorative.
                                                                    </span>
                                                                </div>
                                                                <div className="mt-5">
                                                                    <label className="mb-2">Title</label>
                                                                    <input type="text" className="form-input" placeholder="Enter Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                                                                </div>

                                                                <div className="mt-5">
                                                                    <label className="mb-2">Caption</label>
                                                                    <textarea
                                                                        className="form-input"
                                                                        placeholder="Enter Caption"
                                                                        value={caption}
                                                                        onChange={(e) => setCaption(e.target.value)}
                                                                    ></textarea>
                                                                </div>

                                                                <div className="mt-5">
                                                                    <label className="mb-2">Description</label>
                                                                    <textarea
                                                                        className="form-input"
                                                                        placeholder="Enter Caption"
                                                                        value={mediaDescription}
                                                                        onChange={(e) => setMediaDescription(e.target.value)}
                                                                    ></textarea>
                                                                </div>

                                                                <div className="mt-5">
                                                                    <label className="mb-2">File URL</label>
                                                                    <input type="text" className="form-input" placeholder="Enter Title" value={selectedImg} />
                                                                    <button className="btn btn-primary-outline mt-2 text-sm" onClick={handleCopy}>
                                                                        Copy URL to Clipboard
                                                                    </button>
                                                                    {copied ? <label className="mt-2 text-green-500">Copied</label> : <label className="mt-2">Copy Link</label>}
                                                                </div>
                                                                <div className="flex justify-end">
                                                                    <button type="submit" className="btn btn-primary " onClick={() => updateMediaMetaData()}>
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
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default PrivateRouter(EditCategory);
