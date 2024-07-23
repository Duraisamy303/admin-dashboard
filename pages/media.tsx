import IconX from '@/components/Icon/IconX';
import { deleteImagesFromS3, fetchImagesFromS3, generatePresignedPost, generatePresignedVideoPost, objIsEmpty, separateFiles, showDeleteAlert, useSetState } from '@/utils/functions';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

export default function Media() {
    const longPressTimeout = useRef(null);

    const [state, setState] = useSetState({
        tab: 1,
        imageList: [],
        selectImg: {},
        date: 'all',
        selectedImages: [],
        copied: false,
        longPress: false,
    });

    useEffect(() => {
        getMediaImage();
    }, []);

    const getMediaImage = async () => {
        try {
            const res = await fetchImagesFromS3();
            setState({ imageList: res });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleFileChange = async (e: any) => {
        try {
            let presignedPostData = null;
            if (e.target.files[0]?.name?.endsWith('.mp4')) {
                presignedPostData = await generatePresignedVideoPost(e.target.files[0]);
            } else {
                presignedPostData = await generatePresignedPost(e.target.files[0]);
            }

            const formData = new FormData();
            Object.keys(presignedPostData.fields).forEach((key) => {
                formData.append(key, presignedPostData.fields[key]);
            });
            formData.append('file', e.target.files[0]);

            await axios.post(presignedPostData.url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            getMediaImage();
            setState({ tab: 1 });
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };


    const searchMediaByName = async (e) => {
        setState({ search: e });
        try {
            const res = await fetchImagesFromS3(e);
            setState({ imageList: res });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(state.selectImg?.url).then(() => {
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
        showDeleteAlert(
            async () => {
                await deleteImage();
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Image List is safe :)', 'error');
            }
        );
    };

    const deleteImage = async () => {
        try {
            await deleteImagesFromS3(state.selectImg?.key);
            getMediaImage();
            setState({ selectImg: {} });
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const filterMediaByMonth = async (value: any) => {
        if (value == 'all') {
            getMediaImage();
        } else {
            const [month, year] = value.split('/');
            const monthIndex = new Date(`${month} 1, 2024`).getMonth(); // To get the month index
            const res = await fetchImagesFromS3();
            const filteredImages = res.filter((item) => {
                const itemDate = new Date(item.LastModified);
                return itemDate.getFullYear() === parseInt(year) && itemDate.getMonth() === monthIndex;
            });
            setState({ imageList: filteredImages, date: value });
        }
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
                                setState({ tab: 0 });
                                getMediaImage();
                            }}
                            className={`${state.tab == 0 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 text-lg before:inline-block`}
                        >
                            Upload Files
                        </button>
                        <button
                            onClick={() => {
                                setState({ tab: 1 });

                                getMediaImage();
                            }}
                            className={`${state.tab == 1 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 text-lg before:inline-block`}
                        >
                            Media Library
                        </button>
                    </div>

                    {state.tab == 0 ? (
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
                    ) : (
                        <>
                            <div className="grid grid-cols-12 pt-5">
                                <div className="col-span-9  overflow-y-scroll border-r border-gray-200 pr-5">
                                    <div>
                                        <div>Filter mediaFilter by type</div>
                                    </div>
                                    <div className="flex justify-between gap-3 pt-3">
                                        <div className="flex gap-3">
                                            <select className="form-select w-60 flex-1" value={state.date} onChange={(e) => filterMediaByMonth(e.target.value)}>
                                                <option value="all">All Data</option>
                                                <option value="June/2024">June 2024</option>
                                                <option value="July/2024">July 2024</option>
                                                <option value="August/2024">August 2024</option>
                                            </select>
                                        </div>
                                        <div>
                                            <input type="text" className="form-input mr-2  w-80 " placeholder="Search..." value={state.search} onChange={(e) => searchMediaByName(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-6 pt-5">
                                        {state.imageList?.length > 0 ? (
                                            state.imageList?.map((item) => (
                                                <div
                                                    key={item.url}
                                                    className={`flex h-[150px] w-[150px] overflow-hidden p-2 ${state.selectedImages.includes(item) ? 'border-4 border-blue-500' : ''}`}
                                                    onMouseDown={() => handleMouseDown(item)}
                                                    onMouseUp={handleMouseUp}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => {
                                                        setState({ selectImg: item });
                                                        if (!state.longPress) {
                                                            handleImageSelect(item);
                                                        }
                                                    }}
                                                >
                                                    {item?.key?.endsWith('.mp4') ? (
                                                        <video controls src={item.url} className="h-full w-full object-cover">
                                                            Your browser does not support the video tag.
                                                        </video>
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
                                {!objIsEmpty(state.selectImg) && (
                                    <div className="col-span-3  pl-5">
                                        <div className="border-b border-gray-200 pb-5">
                                            <div>
                                                <p className="mb-2 text-lg font-semibold">ATTACHMENT DETAILS</p>
                                            </div>
                                            <div className="">
                                                {state.selectImg?.key?.endsWith('.mp4') ? (
                                                    <video controls src={state.selectImg.url} className="">
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <img src={state.selectImg.url} alt="" className="" />
                                                )}
                                                {/* <img src={state.selectImg?.url} alt="" className="" /> */}
                                            </div>
                                            <p className="mt-2 font-semibold">{state.selectImg?.key}</p>
                                            <p className="text-sm">{moment(state.selectImg?.LastModified).format('MMM d, yyyy')}</p>
                                            <p className="text-sm">{(state.selectImg?.Size / 1024).toFixed(2)} KB</p>

                                            <a href="#" className="text-danger underline" onClick={() => multiImageDelete()}>
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
                                                <input type="text" className="form-input" placeholder="Enter Title" value={state.selectImg?.url} />
                                                <button className="btn btn-primary-outline mt-2 text-sm" onClick={handleCopy}>
                                                    Copy URL to Clipboard
                                                </button>
                                                {state.copied ? <label className="mt-2 text-green-500">Copied</label> : <label className="mt-2">Copy Link</label>}
                                            </div>
                                            <div className="flex justify-end">
                                                <button type="submit" className="btn btn-primary " onClick={() => {}}>
                                                    {'Update'}
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
