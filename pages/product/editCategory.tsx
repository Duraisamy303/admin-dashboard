import React, { useEffect, useState, Fragment, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import Select from 'react-select';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';

import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import * as Yup from 'yup';
import { useMutation, useQuery } from '@apollo/client';
import { CATEGORY_LIST, CREATE_CATEGORY, DELETE_CATEGORY, PRODUCT_LIST, UPDATE_CATEGORY, UPDATE_CATEGORY_NEW } from '@/query/product';
import { PARENT_CATEGORY_LIST } from '@/query/product';
import IconLoader from '@/components/Icon/IconLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import { Failure, Success, categoryImageUpload, deleteImagesFromS3, fetchImagesFromS3, filterImages, formatOptions, generatePresignedPost, objIsEmpty, profilePic } from '@/utils/functions';
import { useRouter } from 'next/router';
import axios from 'axios';
import moment from 'moment';

const EditCategory = () => {
    const router = useRouter();

    const catId = router?.query?.id;

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Category'));
    });

    const { error, data: categoryData } = useQuery(CATEGORY_LIST, {
        variables: { channel: 'india-channel', first: 100 },
    });

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
    const [selectedCat, setSelectedCat] = useState(null);
    const [mediaMonth, setMediaMonth] = useState('all');
    const [description, setDescription] = useState('');

    const { data: parentList } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    useEffect(() => {
        filterByCategory();
    }, [categoryData, catId]);

    useEffect(() => {
        const getparentCategoryList = parentList?.categories?.edges;
        const options = formatOptions(getparentCategoryList);
        setParentLists(options);
    }, [parentList]);

    //Mutation
    const [updateCategory, { loading }] = useMutation(UPDATE_CATEGORY_NEW);

    useEffect(() => {
        getMediaImage();
    }, []);

    useEffect(() => {
        filterByMonth();
    }, [mediaMonth]);

    const filterByMonth = async () => {
        const res = await fetchImagesFromS3(mediaSearch);
        if (mediaMonth !== 'all') {
            const [month, year] = mediaMonth.split('/');
            const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
            const filteredImages = res?.filter((item) => {
                const itemDate = new Date(item.LastModified);
                return itemDate.getFullYear() === parseInt(year) && itemDate.getMonth() === monthIndex;
            });

            setMediaImages(filteredImages);
        }
    };

    const filterMediaByMonth = async (value: any) => {
        setMediaMonth(value);
    };

    const getMediaImage = async () => {
        try {
            const res = await fetchImagesFromS3();
            const filter = filterImages(res);
            setMediaImages(filter);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const filterByCategory = async () => {
        try {
            const res = categoryData?.categories?.edges;
            const find = res?.find((item) => item?.node?.id == catId);
            setCatData(find?.node);
            setName(find?.node?.name);
            if (find?.node?.description) {
                const jsonObject = JSON.parse(find?.node?.description);
                const textValue = jsonObject?.blocks[0]?.data?.text;
                setDescription(textValue);
            } else {
                setDescription('');
            }
            setPreviewUrl(find?.node?.backgroundImageUrl);
            setSelectedCat({ value: find?.node?.parent?.id, label: find?.node?.parent?.name });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    // FORM VALIDATION
    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required('Please fill the Category Name'),
    });

    // form submit
    const onSubmit = async () => {
        try {
            const Description = JSON.stringify({ time: Date.now(), blocks: [{ id: 'some-id', data: { text: description }, type: 'paragraph' }], version: '2.24.3' });

            const variables = {
                input: {
                    name: name,
                    description: Description,
                    backgroundImageUrl: previewUrl ? previewUrl : '',
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
            const res = await fetchImagesFromS3(e);
            setMediaImages(res);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(selectedImg?.url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };

    const handleFileChange = async (e) => {
        try {
            const presignedPostData: any = await generatePresignedPost(e.target.files[0]);

            const formData = new FormData();
            Object.keys(presignedPostData.fields).forEach((key) => {
                formData.append(key, presignedPostData.fields[key]);
            });
            formData.append('file', e.target.files[0]);

            const response = await axios.post(presignedPostData.url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            getMediaImage();
            setMediaTab(1);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const deleteImage = async () => {
        try {
            const res = await deleteImagesFromS3(selectedImg?.key);
            getMediaImage();
            setSelectedImg({});
        } catch (error) {
            console.error('Error deleting file:', error);
        }
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
                        setSelectedImg({});
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
                                        <div className="flex gap-5">
                                            <button
                                                onClick={() => {
                                                    setMediaTab(0);
                                                    getMediaImage();
                                                }}
                                                className={`${mediaTab == 0 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 before:inline-block `}
                                            >
                                                Upload Files
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMediaTab(1);
                                                    getMediaImage();
                                                }}
                                                className={`${mediaTab == 1 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 before:inline-block `}
                                            >
                                                Media Library
                                            </button>
                                        </div>

                                        {mediaTab == 0 ? (
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
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-12 pt-5">
                                                    <div className="col-span-9 h-[450px] overflow-y-scroll border-r border-gray-200 pr-5">
                                                        <div>
                                                            <div>Filter mediaFilter by type</div>
                                                        </div>
                                                        <div className="flex justify-between gap-3 pt-3">
                                                            <div className="flex gap-3">
                                                                <select className="form-select w-60 flex-1" value={mediaMonth} onChange={(e) => filterMediaByMonth(e.target.value)}>
                                                                    <option value="all">All Data</option>
                                                                    <option value="June/2024">June 2024</option>
                                                                    <option value="July/2024">July 2024</option>
                                                                    <option value="August/2024">August 2024</option>
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
                                                                        key={item.url}
                                                                        className={`flex h-[200px] w-[170px] overflow-hidden p-2  ${selectedImg?.url == item?.url ? 'border-4 border-blue-500' : ''}`}
                                                                        // onMouseDown={() => handleMouseDown(item)}
                                                                        // onMouseUp={handleMouseUp}
                                                                        // onMouseLeave={handleMouseLeave}
                                                                        onClick={() => {
                                                                            setSelectedImg(item);
                                                                        }}
                                                                    >
                                                                        {item?.key?.endsWith('.mp4') ? (
                                                                            <video controls src={item.url} className="h-full w-full object-cover">
                                                                                Your browser does not support the video tag.
                                                                            </video>
                                                                        ) : (
                                                                            <img src={item.url} alt="" className="h-full w-full" />
                                                                        )}
                                                                        {/* <img src={item.url} alt="" className="h-full w-full object-cover" /> */}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="col-span-6 flex h-64 items-center justify-center">No Data Found</div>
                                                            )}
                                                        </div>
                                                        {/* <div className="flex justify-center pt-5">
                                                                    <div className=" text-center">
                                                                        <p>Showing 80 of 2484 media items</p>
                                                                        <div className="flex justify-center">
                                                                            <button className="btn btn-primary mt-2">Load more</button>
                                                                        </div>
                                                                    </div>
                                                                </div> */}
                                                    </div>
                                                    {!objIsEmpty(selectedImg) && (
                                                        <div className="col-span-3 h-[450px] overflow-y-scroll pl-5">
                                                            <div className="border-b border-gray-200 pb-5">
                                                                <div>
                                                                    <p className="mb-2 text-lg font-semibold">ATTACHMENT DETAILS</p>
                                                                </div>
                                                                {selectedImg?.url?.endsWith('.mp4') ? (
                                                                    <video controls src={selectedImg?.url} className="h-full w-full object-cover" style={{ height: '300px' }}>
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                ) : (
                                                                    <img src={selectedImg.url} alt="" className="h-full w-full" />
                                                                )}

                                                                <p className="mt-2 font-semibold">{selectedImg?.key}</p>
                                                                <p className="text-sm">{moment(selectedImg?.LastModified).format('MMM d, yyyy')}</p>
                                                                <p className="text-sm">{(selectedImg?.Size / 1024).toFixed(2)} KB</p>

                                                                {/* <p className="text-sm">1707 by 2560 pixels</p> */}
                                                                <a href="#" className="text-danger underline" onClick={() => deleteImage()}>
                                                                    Delete permanently
                                                                </a>
                                                            </div>
                                                            <div className="pr-5">
                                                                <div className="mt-5">
                                                                    <label className="mb-2">Alt Text</label>
                                                                    <textarea className="form-input" placeholder="Enter Alt Text"></textarea>
                                                                    <span>
                                                                        <a href="#" className="text-primary underline">
                                                                            Learn how to describe the purpose of the image
                                                                        </a>
                                                                        . Leave empty if the image is purely decorative.
                                                                    </span>
                                                                </div>
                                                                <div className="mt-5">
                                                                    <label className="mb-2">Title</label>
                                                                    <input type="text" className="form-input" placeholder="Enter Title" />
                                                                </div>

                                                                <div className="mt-5">
                                                                    <label className="mb-2">Caption</label>
                                                                    <textarea className="form-input" placeholder="Enter Caption"></textarea>
                                                                </div>

                                                                <div className="mt-5">
                                                                    <label className="mb-2">File URL</label>
                                                                    <input type="text" className="form-input" placeholder="Enter Title" value={selectedImg?.url} />
                                                                    <button className="btn btn-primary-outline mt-2 text-sm" onClick={handleCopy}>
                                                                        Copy URL to Clipboard
                                                                    </button>
                                                                    {copied ? <label className="mt-2 text-green-500">Copied</label> : <label className="mt-2">Copy Link</label>}
                                                                </div>
                                                                <div className="mt-5">
                                                                    <p>Required fields are marked *</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-5 flex justify-end border-t border-gray-200 pt-5">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() => {
                                                            if (objIsEmpty(selectedImg)) {
                                                                Failure('Please select an image');
                                                            } else {
                                                                setPreviewUrl(selectedImg?.url);
                                                                setMediaOpen(false);
                                                                setSelectedImg({});
                                                            }
                                                        }}
                                                    >
                                                        Set Product Image
                                                    </button>
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
