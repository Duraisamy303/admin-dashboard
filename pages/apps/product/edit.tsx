import React, { useEffect, useState, Fragment, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import Select from 'react-select';
import 'react-quill/dist/quill.snow.css';
import pdf from '../../../public/assets/images/pdf.png';
import docs from '../../../public/assets/images/docs.jpg';
import { Tab } from '@headlessui/react';
import AnimateHeight from 'react-animate-height';
import { useMutation, useQuery } from '@apollo/client';
import {
    ASSIGN_TAG_PRODUCT,
    CATEGORY_LIST,
    CHANNEL_LIST,
    COLLECTION_LIST,
    COLOR_LIST,
    CREATE_PRODUCT,
    CREATE_VARIANT,
    DELETE_VARIENT,
    DESIGN_LIST,
    FINISH_LIST,
    PARENT_CATEGORY_LIST,
    PRODUCTS_MEDIA_ORDERS,
    PRODUCT_BY_NAME,
    PRODUCT_CAT_LIST,
    PRODUCT_DETAILS,
    PRODUCT_FULL_DETAILS,
    PRODUCT_LIST_TAGS,
    PRODUCT_MEDIA_CREATE,
    PRODUCT_MEDIA_CREATE_NEW,
    PRODUCT_TYPE_LIST,
    RELATED_PRODUCT,
    REMOVE_IMAGE,
    SIZE_LIST,
    STONE_LIST,
    STYLE_LIST,
    TYPE_LIST,
    UPDATE_META_DATA,
    UPDATE_PRODUCT,
    UPDATE_PRODUCT_CHANNEL,
    UPDATE_VARIANT,
    UPDATE_VARIANT_LIST,
    PRODUCT_LIST_BY_ID,
} from '@/query/product';
import {
    Failure,
    Success,
    addCommasToNumber,
    addNewFile,
    deleteImagesFromS3,
    docFilter,
    fetchImagesFromS3,
    formatOptions,
    generatePresignedPost,
    getValueByKey,
    imageFilter,
    isEmptyObject,
    months,
    objIsEmpty,
    sampleParams,
    showDeleteAlert,
    uploadImage,
    videoFilter,
} from '@/utils/functions';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import IconLoader from '@/components/Icon/IconLoader';
import moment from 'moment';
import axios from 'axios';
import { productPreview } from '@/store/authConfigSlice';
import { channel } from 'diagnostics_channel';
import { endsWith } from 'lodash';
import CommonLoader from '@/pages/elements/commonLoader';
import Image from 'next/image';
const ProductEdit = (props: any) => {
    const router = useRouter();

    const { id } = router.query;

    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [modal1, setModal1] = useState(false);
    const [modal2, setModal2] = useState(false);
    const [mediaImages, setMediaImages] = useState([]);
    const [selectedImg, setSelectedImg] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [mediaTab, setMediaTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Update Product'));
    });

    const [isMounted, setIsMounted] = useState(false); //tabs
    useEffect(() => {
        setIsMounted(true);
    });
    const [menuOrder, setMenuOrder] = useState(0);
    const [selectedUpsell, setSelectedUpsell] = useState([]);
    const [selectedCrosssell, setSelectedCrosssell] = useState([]);
    const [mediaDate, setMediaDate] = useState('all');
    const [keyword, setKeyword] = useState('');
    // ------------------------------------------New Data--------------------------------------------

    const [productName, setProductName] = useState('');
    const [slug, setSlug] = useState('');
    const [seoTittle, setSeoTittle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');

    const [shortDescription, setShortDescription] = useState('');
    const [mediaSearch, setMediaSearch] = useState('');

    const [description, setDescription] = useState('');
    const [selectedCollection, setSelectedCollection] = useState<any>([]);
    const [publish, setPublish] = useState('published');

    // error message start

    const [productNameErrMsg, setProductNameErrMsg] = useState('');
    const [slugErrMsg, setSlugErrMsg] = useState('');
    const [seoTittleErrMsg, setSeoTittleErrMsg] = useState('');
    const [seoDescErrMsg, setSeoDescErrMsg] = useState('');
    const [descriptionErrMsg, setDescriptionErrMsg] = useState('');
    const [productListUpsell, setProductListUpsell] = useState([]);
    const [productListCrossell, setProductListCrossell] = useState([]);
    const [searchUpsells, setSearchUpsells] = useState('');
    const [searchCrossell, setSearchCrossell] = useState('');
    const [shortDesErrMsg, setShortDesErrMsg] = useState('');
    const [categoryErrMsg, setCategoryErrMsg] = useState('');
    const [attributeError, setAttributeError] = useState('');
    const [variantErrors, setVariantErrors] = useState<any>([]);

    // error message end

    // ------------------------------------------New Data--------------------------------------------
    const [quantityTrack, setQuantityTrack] = useState(true);
    const [active, setActive] = useState<string>('1');

    const options = [
        { value: 'New', label: 'New' },
        { value: 'Hot', label: 'Hot' },
    ];

    // -------------------------------------New Added-------------------------------------------------------
    const { data: productDetails } = useQuery(PRODUCT_FULL_DETAILS, {
        variables: { channel: 'india-channel', id: id },
    });

    const { refetch: relatedProductsRefetch } = useQuery(RELATED_PRODUCT);

    const { data: tagsList } = useQuery(PRODUCT_LIST_TAGS, {
        variables: { channel: 'india-channel', id: id },
    });

    const { refetch: productListRefetch } = useQuery(PRODUCT_LIST_BY_ID);

    const [createMedia] = useMutation(PRODUCT_MEDIA_CREATE_NEW);

    const { data: collection_list } = useQuery(COLLECTION_LIST, {
        variables: sampleParams,
    });

    const { data: productTypelist } = useQuery(PRODUCT_TYPE_LIST, {
        variables: sampleParams,
    });

    const { data: finishData, refetch: finishRefetch } = useQuery(FINISH_LIST, {
        variables: sampleParams,
    });

    const { data: stoneData, refetch: stoneRefetch } = useQuery(STONE_LIST, {
        variables: sampleParams,
    });
    const { data: designData, refetch: designRefetch } = useQuery(DESIGN_LIST, {
        variables: sampleParams,
    });
    const { data: styleData, refetch: styleRefetch } = useQuery(STYLE_LIST, {
        variables: sampleParams,
    });

    const { data: stoneColorData, refetch: stoneColorRefetch } = useQuery(COLOR_LIST, {
        variables: sampleParams,
    });

    const { data: typeData, refetch: typeRefetch } = useQuery(TYPE_LIST, {
        variables: sampleParams,
    });

    const { data: sizeData, refetch: sizeRefetch } = useQuery(SIZE_LIST, {
        variables: sampleParams,
    });

    const { data: parentList, error: parentListError } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    const [addFormData] = useMutation(CREATE_PRODUCT);
    const [updateProductChannelList] = useMutation(UPDATE_PRODUCT_CHANNEL);
    const [updateVariantList] = useMutation(UPDATE_VARIANT_LIST);
    const [updateVariant] = useMutation(UPDATE_VARIANT);
    const [updateMedatData] = useMutation(UPDATE_META_DATA);
    const [assignTagToProduct] = useMutation(ASSIGN_TAG_PRODUCT);
    const [mediaReorder] = useMutation(PRODUCTS_MEDIA_ORDERS);
    const [createVariant] = useMutation(CREATE_VARIANT);
    const [removeImage] = useMutation(REMOVE_IMAGE);
    const [updateProduct] = useMutation(UPDATE_PRODUCT);
    const [deleteVarient] = useMutation(DELETE_VARIENT);
    const longPressTimeout = useRef(null);
    const [createProductMedia] = useMutation(PRODUCT_MEDIA_CREATE);

    const { data: productSearch, refetch: productSearchRefetch } = useQuery(PRODUCT_BY_NAME);

    const [categoryList, setCategoryList] = useState([]);
    const [tagList, setTagList] = useState([]);
    const [selectedTag, setSelectedTag] = useState([]);
    const [collectionList, setCollectionList] = useState([]);
    const [label, setLabel] = useState<any>('');
    const [productData, setProductData] = useState({});
    const [modal4, setModal4] = useState(false);

    const [productType, setProductType] = useState([]);
    const [mediaData, setMediaData] = useState([]);
    const [productList, setProductList] = useState([]);
    const [isOpenPreview, setIsOpenPreview] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [productPreview, setPreviewData] = useState(null);
    const [previewSelectedImg, setPreviewSelectedImg] = useState(null);

    const [imageUrl, setImageUrl] = useState([]);

    const [thumbnail, setThumbnail] = useState('');

    const [images, setImages] = useState<any>([]);
    const [copied, setCopied] = useState(false);
    const [isLongPress, setIsLongPress] = useState(false);
    const [deletedImages, setDeletedImages] = useState<any>([]);
    const [selectedArr, setSelectedArr] = useState<any>([]);
    const [attDropDownError, setAttDropDownError] = useState('');
    const [accordions, setAccordions] = useState<any>([]);
    const [openAccordion, setOpenAccordion] = useState<any>('');
    const [chooseType, setChooseType] = useState<any>('');
    const [selectedValues, setSelectedValues] = useState<any>({});
    const [dropdowndata, setDropdownData] = useState<any>([]);
    const [dropIndex, setDropIndex] = useState<any>(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [mediaMonth, setMediaMonth] = useState('all');
    const [mediaType, setMediaType] = useState('all');

    const [variants, setVariants] = useState([
        {
            sku: '',
            stackMgmt: false,
            quantity: 0,
            regularPrice: 0,
            salePrice: 0,
            name: '',
            id: '',
        },
    ]);

    const [selectedCat, setselectedCat] = useState<any>([]);

    useEffect(() => {
        productsDetails();
    }, [productDetails]);

    useEffect(() => {
        tags_list();
    }, [tagsList]);

    useEffect(() => {
        getMediaImage();
    }, []);

    useEffect(() => {
        filterByType();
    }, [mediaType]);

    const getMediaImage = async () => {
        try {
            setLoading(true);
            const res = await fetchImagesFromS3();
            if (mediaType == 'all') {
                setMediaImages(res);
            } else if (mediaType == 'image') {
                const response = imageFilter(res);
                setMediaImages(response);
            } else if (mediaType == 'video') {
                const response = videoFilter(res);
                setMediaImages(response);
            } else {
                const response = docFilter(res);
                setMediaImages(response);
            }
            setLoading(false);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const filterByType = async () => {
        const res = await fetchImagesFromS3(mediaSearch);
        if (mediaType == 'all') {
            setMediaImages(res);
        } else if (mediaType == 'image') {
            const response = imageFilter(res);
            setMediaImages(response);
        } else if (mediaType == 'video') {
            const response = videoFilter(res);
            setMediaImages(response);
        } else {
            const response = docFilter(res);
            setMediaImages(response);
        }
    };

    useEffect(() => {
        collections_list();
    }, [collection_list]);

    useEffect(() => {
        productsType();
    }, [productTypelist]);

    useEffect(() => {
        getProductForUpsells();
    }, [searchUpsells]);

    useEffect(() => {
        getProductForCrossell();
    }, [searchCrossell]);

    useEffect(() => {
        const getparentCategoryList = parentList?.categories?.edges;
        setCategoryList(getparentCategoryList);
    }, [parentList]);

    useEffect(() => {
        const getparentCategoryList = parentList?.categories?.edges;
        const options = formatOptions(getparentCategoryList);
        setCategoryList(options);
    }, [parentList]);

    useEffect(() => {
        filterByMonth();
    }, [mediaMonth]);

    const filterByMonth = async () => {
        const res = await fetchImagesFromS3(mediaSearch);
        if (mediaMonth == 'all') {
            getMediaImage();
        } else {
            const [month, year] = mediaMonth.split('/');
            const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
            const filteredImages = res?.filter((item) => {
                const itemDate = new Date(item.LastModified);
                return itemDate.getFullYear() === parseInt(year) && itemDate.getMonth() === monthIndex;
            });
            if (mediaType == 'all') {
                setMediaImages(filteredImages);
            } else if (mediaType == 'image') {
                const response = imageFilter(filteredImages);
                setMediaImages(response);
            } else if (mediaType == 'video') {
                const response = videoFilter(filteredImages);
                setMediaImages(response);
            } else {
                const response = docFilter(filteredImages);
                setMediaImages(response);
            }
        }
    };

    const productsDetails = async () => {
        try {
            if (productDetails) {
                if (productDetails && productDetails?.product) {
                    const data = productDetails?.product;
                    setProductData(data);
                    setSlug(data?.slug);
                    setSeoTittle(data?.seoTitle);
                    setSeoDesc(data?.seoDescription);
                    setProductName(data?.name);

                    let upsells = [];
                    if (data?.getUpsells?.length > 0) {
                        upsells = data?.getUpsells?.map((item) => ({ value: item.productId, label: item.name }));
                    }
                    setSelectedUpsell(upsells);

                    let crossells = [];
                    if (data?.getCrosssells?.length > 0) {
                        crossells = data?.getCrosssells?.map((item) => ({ value: item.productId, label: item.name }));
                    }

                    setselectedCat(data?.category?.map((item) => ({ value: item.id, label: item.name })));
                    setSelectedCrosssell(crossells);

                    if (data?.tags?.length > 0) {
                        const tags: any = data?.tags?.map((item: any) => ({ value: item.id, label: item.name }));
                        setSelectedTag(tags);
                    } else {
                        setSelectedTag([]);
                    }
                    if (data?.collections?.length > 0) {
                        const collection: any = data?.collections?.map((item: any) => ({ value: item.id, label: item.name }));
                        setSelectedCollection(collection);
                    }
                    setMenuOrder(data?.orderNo);

                    const Description = JSON.parse(data.description);
                    DescriptionEditor(Description);

                    const shortDesc = getValueByKey(data?.metadata, 'short_description');
                    setShortDescription(shortDesc);

                    const keywords = getValueByKey(data?.metadata, 'keyword');
                    setKeyword(keywords);

                    const label = getValueByKey(data?.metadata, 'label');
                    setLabel({ value: label, label: label });

                    const desc = getValueByKey(data?.metadata, 'description');
                    setDescription(desc);

                    setMediaData(data?.media);
                    setThumbnail(data?.thumbnail?.url);

                    if (data?.media?.length > 0) {
                        setImages(data?.media);
                        setImageUrl(data?.media?.map((item) => item.url));
                    }

                    Attributes(data);
                    if (data?.variants?.length > 0) {
                        const variant = data?.variants?.map((item: any) => ({
                            sku: item.sku,
                            stackMgmt: item.trackInventory,
                            quantity: item?.stocks[0]?.quantity,
                            regularPrice: item.channelListings[0]?.costPrice?.amount,
                            salePrice: item.channelListings[0]?.price?.amount,
                            name: item.name,
                            id: item.id,
                            channelId: item.channelListings[0]?.id,
                            stockId: item?.stocks[0]?.id,
                        }));
                        setVariants(variant);
                    }
                    setPublish(data?.channelListings[0]?.isPublished == true ? 'published' : 'draft');

                    // setRegularPrice()
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const Attributes = async (data) => {
        const styleRes = await styleRefetch({
            sampleParams,
        });

        const designRes = await designRefetch({
            sampleParams,
        });

        const finishRes = await finishRefetch({
            sampleParams,
        });

        const stoneTypeRes = await stoneRefetch({
            sampleParams,
        });

        const stoneColorRes = await stoneColorRefetch({
            sampleParams,
        });

        const typeRes = await typeRefetch({
            sampleParams,
        });

        const sizeRes = await sizeRefetch({
            sampleParams,
        });

        const arr1 = {
            design: designRes?.data?.productDesigns,
            style: styleRes?.data?.productStyles,
            finish: finishRes?.data?.productFinishes,
            stoneType: stoneTypeRes?.data?.productStoneTypes,
            stoneColor: stoneColorRes?.data?.stoneColors,
            type: typeRes?.data?.itemTypes,
            size: sizeRes?.data?.sizes,
        };

        const singleObj = Object.entries(arr1).reduce((acc: any, [key, value]) => {
            acc[key] = value?.edges.map(({ node }: any) => ({ value: node?.id, label: node?.name }));
            return acc;
        }, {});

        setDropdownData(singleObj);

        const arr = [];
        const type: any[] = [];
        let selectedAccValue: any = {};

        const attributes = [
            { key: 'prouctDesign', type: 'design', name: 'designName', dropdowndataKey: 'design' },
            { key: 'productstyle', type: 'style', name: 'styleName', dropdowndataKey: 'style' },
            { key: 'productStoneType', type: 'stone', name: 'stoneName', dropdowndataKey: 'stoneType' },
            { key: 'productFinish', type: 'finish', name: 'finishName', dropdowndataKey: 'finish' },
            { key: 'productStonecolor', type: 'stoneColor', name: 'stoneColorName', dropdowndataKey: 'stoneColor' },
            { key: 'productItemtype', type: 'type', name: 'typeName', dropdowndataKey: 'type' },
            { key: 'productSize', type: 'size', name: 'sizeName', dropdowndataKey: 'size' },
        ];

        attributes.forEach((attribute) => {
            if (data?.[attribute.key]?.length > 0) {
                const obj = {
                    type: attribute.type,
                    [attribute.name]: singleObj?.[attribute.dropdowndataKey],
                };
                arr.push(obj);
                type.push(attribute.type);
                selectedAccValue[attribute.type] = data?.[attribute.key].map((item: any) => item.id);
            }
        });
        // if (data?.prouctDesign?.length > 0) {
        //     const obj = {
        //         type: 'design',
        //         designName: dropdowndata?.design,
        //     };
        //     arr.push(obj);
        //     type.push('design');
        //     selectedAccValue.design = data?.prouctDesign?.map((item: any) => item.id);
        // }

        setAccordions(arr.flat());
        setSelectedArr(type);
        setSelectedValues(selectedAccValue);
    };

    const DescriptionEditor = async (Description) => {
        try {
            let formattedData = {};
            if (Description && Description.blocks) {
                const formattedBlocks = Description.blocks.map((block) => ({
                    ...block,
                    data: {
                        ...block.data,
                        text: block.data.text ? block.data.text.replace(/\n/g, '<br>') : block.data.text, // Convert newlines to <br> for HTML display if text exists
                    },
                }));
                formattedData = {
                    ...Description,
                    blocks: formattedBlocks,
                };
            }

            let editors = { isReady: false };
            if (!editors.isReady) {
                editor(formattedData);
                editors.isReady = true;
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    // editor start

    const editorRef = useRef(null);
    const [editorInstance, setEditorInstance] = useState(null);
    const [content, setContent] = useState('');

    const editor = useCallback((value) => {
        // Check if the window object is available and if the editorRef.current is set
        if (typeof window === 'undefined' || !editorRef.current) return;

        // Ensure only one editor instance is created
        if (editorInstance) {
            return;
        }

        // Dynamically import the EditorJS module
        import('@editorjs/editorjs').then(({ default: EditorJS }) => {
            // Create a new instance of EditorJS with the appropriate configuration
            const editor = new EditorJS({
                holder: editorRef.current,
                data: value,
                tools: {
                    // Configure tools as needed
                    header: {
                        class: require('@editorjs/header'),
                    },
                    list: {
                        class: require('@editorjs/list'),
                    },
                    table: {
                        class: require('@editorjs/table'),
                    },
                },
            });

            // Set the editorInstance state variable
            setEditorInstance(editor);
        });

        // Cleanup function to destroy the current editor instance when the component unmounts
        return () => {
            if (editorInstance) {
                editorInstance?.blocks?.clear();
            }
        };
    }, []);

    // editor end

    const tags_list = async () => {
        try {
            if (tagsList) {
                if (tagsList && tagsList?.tags?.edges?.length > 0) {
                    const list = tagsList?.tags?.edges;
                    const dropdownData = list?.map((item: any) => {
                        return { value: item.node?.id, label: item.node?.name };
                    });
                    setTagList(dropdownData);
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const collections_list = async () => {
        try {
            if (collection_list) {
                if (collection_list && collection_list?.search?.edges?.length > 0) {
                    const list = collection_list?.search?.edges;
                    const dropdownData = list?.map((item: any) => {
                        return { value: item.node?.id, label: item.node?.name };
                    });

                    setCollectionList(dropdownData);
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const productsType = async () => {
        try {
            if (productTypelist) {
                if (productTypelist && productTypelist?.search?.edges?.length > 0) {
                    const list = productTypelist?.search?.edges;
                    const dropdownData = list?.map((item: any) => {
                        return { value: item.node?.id, label: item.node?.name };
                    });

                    setProductType(dropdownData);
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const selectCat = (cat: any) => {
        setselectedCat(cat);
        // console.log("cat: ", cat);
    };

    const selectedCollections = (data: any) => {
        setSelectedCollection(data);
    };

    // Function to handle file selection
    // const handleFileChange = async (e) => {
    //     try {
    //         setLoading(true);

    //         const presignedPostData: any = await generatePresignedPost(e.target.files[0]);

    //         const formData = new FormData();
    //         Object.keys(presignedPostData.fields).forEach((key) => {
    //             formData.append(key, presignedPostData.fields[key]);
    //         });
    //         formData.append('file', e.target.files[0]);

    //         const response = await axios.post(presignedPostData.url, formData, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',
    //             },
    //         });
    //         getMediaImage();
    //         setMediaTab(1);
    //     } catch (error) {
    //         console.error('Error uploading file:', error);
    //     }
    // };

    const handleFileChange = async (e: any) => {
        try {
            setLoading(true);
            const res = await addNewFile(e);
            getMediaImage();
            setMediaTab(1);
            setLoading(false);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const multiImgUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile: any = event.target.files?.[0];
        setModal4(false);
        const res = await uploadImage(id, selectedFile);
        setImages(res?.data?.productMediaCreate?.product?.media);
    };

    const multiImageDelete = async (val: any) => {
        showDeleteAlert(
            async () => {
                // const { data } = await removeImage({
                //     variables: { id: val },
                // });
                setDeletedImages([...deletedImages, val]);
                // const filter = images?.filter((item) => item.url !== val);
                const filter = images?.filter((item) => item.id !== val.id);
                setImages(filter);
                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Image List is safe :)', 'error');
            }
        );
    };

    const validateMainFields = (savedContent) => {
        const errors = {
            productName: productName.trim() === '' ? 'Product name cannot be empty' : '',
            slug: slug.trim() === '' ? 'Slug cannot be empty' : '',
            seoTittle: seoTittle.trim() === '' ? 'Seo title cannot be empty' : '',
            seoDesc: seoDesc.trim() === '' ? 'Seo description cannot be empty' : '',
            description: savedContent?.blocks?.length === 0 ? 'Description cannot be empty' : '',
            shortDescription: shortDescription?.trim() === '' ? 'Short description cannot be empty' : '',
            category: selectedCat?.length === 0 ? 'Category cannot be empty' : '',
        };

        return errors;
    };

    // Helper function to validate variants
    const validateVariants = () => {
        return variants.map((variant) => {
            const errors: any = {};
            if (!variant.sku) errors.sku = 'SKU cannot be empty';
            // if (variant.quantity <= 0 || isNaN(variant.quantity)) errors.quantity = 'Quantity must be a valid number and greater than 0';
            // if (variant.regularPrice <= 0 || isNaN(variant.regularPrice)) errors.regularPrice = 'Regular Price must be a valid number and greater than 0';
            // if (!variant.stackMgmt) errors.stackMgmt = 'Check Stack Management';
            return errors;
        });
    };

    // Helper function to validate attributes
    const validateAttributes = () => {
        const attributeErrors = {};
        const attributeChecks = {
            stone: 'Stone cannot be empty',
            design: 'Design cannot be empty',
            style: 'Style cannot be empty',
            finish: 'Finish cannot be empty',
            type: 'Type cannot be empty',
            size: 'Size cannot be empty',
            stoneColor: 'Stone color cannot be empty',
        };

        Object.keys(attributeChecks).forEach((key) => {
            if (selectedValues.hasOwnProperty(key) && (!selectedValues[key] || selectedValues[key].length === 0)) {
                attributeErrors[key] = attributeChecks[key];
            }
        });

        return attributeErrors;
    };

    const updateProducts = async () => {
        try {
            const savedContent = await editorInstance.save();
            const descr = JSON.stringify(savedContent, null, 2);

            // Reset error messages
            setProductNameErrMsg('');
            setSlugErrMsg('');
            setSeoTittleErrMsg('');
            setSeoDescErrMsg('');
            setShortDesErrMsg('');
            setCategoryErrMsg('');
            setDescriptionErrMsg('');
            setAttributeError('');
            setVariantErrors([]);

            // Validation
            const errors = validateMainFields(JSON.parse(descr));
            console.log('errors: ', errors);
            const variantErrors = validateVariants();
            console.log('variantErrors: ', variantErrors);
            const attributeErrors: any = validateAttributes();
            console.log('attributeErrors: ', attributeErrors);

            // Set errors
            setProductNameErrMsg(errors.productName);
            setSlugErrMsg(errors.slug);
            setSeoTittleErrMsg(errors.seoTittle);
            setSeoDescErrMsg(errors.seoDesc);
            setDescriptionErrMsg(errors.description);
            setShortDesErrMsg(errors.shortDescription);
            setCategoryErrMsg(errors.category);
            setVariantErrors(variantErrors);

            if (Object.keys(attributeErrors).length > 0) {
                setAttributeError(attributeErrors);
            }

            // Check if any error exists
            if (Object.values(errors).some((msg) => msg !== '') || variantErrors.some((err) => Object.keys(err).length > 0) || Object.keys(attributeErrors).length > 0) {
                // setCreateLoading(false);
                Failure('Please fill in all required fields');
                return; // Exit if any error exists
            }

            let upsells = [];
            if (selectedUpsell?.length > 0) {
                upsells = selectedUpsell?.map((item) => item?.value);
            }
            let crosssells = [];
            if (selectedCrosssell?.length > 0) {
                crosssells = selectedCrosssell?.map((item) => item?.value);
            }

            const tagId = selectedTag?.map((item) => item.value) || [];
            // const savedContent = await editorInstance.save();
            // const descr = JSON.stringify(savedContent, null, 2);
            const { data } = await updateProduct({
                variables: {
                    id: id,
                    input: {
                        attributes: [],
                        category: selectedCat?.map((item) => item?.value),
                        collections: selectedCollection.map((item) => item.value),
                        tags: tagId,
                        name: productName,
                        description: descr,
                        rating: 0,
                        seo: {
                            description: seoDesc,
                            title: seoTittle,
                        },
                        upsells,
                        crosssells,
                        slug: slug,
                        ...(menuOrder && menuOrder > 0 && { order_no: menuOrder }),
                        ...(selectedValues && selectedValues.design && { prouctDesign: selectedValues.design }),
                        ...(selectedValues && selectedValues.style && { productstyle: selectedValues.style }),
                        ...(selectedValues && selectedValues.finish && { productFinish: selectedValues.finish }),
                        ...(selectedValues && selectedValues.stone && { productStoneType: selectedValues.stone }),
                        ...(selectedValues && selectedValues.type && { productItemtype: selectedValues.type }),
                        ...(selectedValues && selectedValues.size && { productSize: selectedValues.size }),
                        ...(selectedValues && selectedValues.stoneColor && { productStonecolor: selectedValues.stoneColor }),
                    },
                    firstValues: 10,
                },
            });

            if (data?.productUpdate?.errors?.length > 0) {
                Failure(data?.productUpdate?.errors[0]?.message);
                setUpdateLoading(false);
            } else {
                productChannelListUpdate();
            }
        } catch (error) {
            setUpdateLoading(false);
        } finally {
            setUpdateLoading(false);
        }
    };

    const productChannelListUpdate = async () => {
        try {
            const { data } = await updateProductChannelList({
                variables: {
                    id: id,
                    input: {
                        updateChannels: [
                            {
                                availableForPurchaseDate: null,
                                channelId: 'Q2hhbm5lbDoy',
                                isAvailableForPurchase: true,
                                isPublished: publish == 'draft' ? false : true,
                                publicationDate: null,
                                visibleInListings: true,
                            },
                        ],
                    },
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productChannelListingUpdate?.errors?.length > 0) {
                setUpdateLoading(false);
                Failure(data?.productChannelListingUpdate?.errors[0]?.message);
            } else {
                variantListUpdate();
                const updatedImg = images?.map((item: any) => item.id);
                if (deletedImages?.length > 0) {
                    deletedImages?.map(async (val: any) => {
                        const { data } = await removeImage({
                            variables: { id: val.id },
                        });
                    });
                }
                await mediaReorder({
                    variables: {
                        mediaIds: updatedImg,
                        productId: id,
                    },
                });
            }
        } catch (error) {
            setUpdateLoading(false);

            console.log('error: ', error);
        }
    };

    const variantListUpdate = async () => {
        try {
            const arrayOfVariants = variants?.map((item: any) => ({
                attributes: [],
                id: item.id,
                sku: item.sku,
                name: item.name,
                trackInventory: item.stackMgmt,
                channelListings: {
                    update: [
                        {
                            channelListing: item.channelId,
                            price: item.regularPrice,
                            costPrice: item.regularPrice,
                        },
                    ],
                },
                stocks: {
                    update: [
                        {
                            quantity: item.quantity,
                            stock: item.stockId,
                        },
                    ],
                },
            }));

            // const NewAddedVariant = arrayOfVariants.filter((item) => item.id == undefined);
            const NewAddedVariant = variants.filter((item) => item.id == undefined);

            const updateArr = arrayOfVariants.filter((item) => item.id != undefined);

            if (NewAddedVariant?.length > 0) {
                bulkVariantCreate(NewAddedVariant);
            } else {
                const { data } = await updateVariant({
                    variables: {
                        product: id,
                        input: updateArr,
                        errorPolicy: 'REJECT_FAILED_ROWS',
                    },
                });

                if (data?.productVariantBulkUpdate?.errors?.length > 0) {
                    setUpdateLoading(false);
                    Failure(data?.productVariantBulkUpdate?.errors[0]?.message);
                } else {
                    const results = data?.productVariantBulkUpdate?.results || [];

                    if (results.length > 0) {
                        // Find the first result with errors
                        const firstErrorResult = results.find((result) => result.errors?.length > 0);

                        if (firstErrorResult) {
                            const errorMessage = firstErrorResult.errors[0]?.message;
                            if (errorMessage) {
                                Failure(errorMessage);
                            }
                        } else {
                            if (NewAddedVariant?.length === 0) {
                                updateMetaData();
                            }
                        }
                    } else {
                        if (NewAddedVariant?.length === 0) {
                            updateMetaData();
                        }
                    }
                }
            }
        } catch (error) {
            setUpdateLoading(false);

            console.log('error: ', error);
        }
    };

    const updateMetaData = async () => {
        try {
            const input = [];
            if (shortDescription) {
                input.push({
                    key: 'short_description',
                    value: shortDescription ? shortDescription : '',
                });
            }
            if (keyword) {
                input.push({
                    key: 'keyword',
                    value: keyword,
                });
            }
            if (label?.value) {
                input.push({
                    key: 'label',
                    value: label.value,
                });
            }
            const { data } = await updateMedatData({
                variables: {
                    id: id,
                    input,
                    keysToDelete: [],
                },
            });
            if (data?.updateMetadata?.errors?.length > 0) {
                setUpdateLoading(false);
                Failure(data?.updateMetadata?.errors[0]?.message);
            } else {
                Success('Product updated successfully');
                router.push('/');
                setUpdateLoading(false);
            }
        } catch (error) {
            setUpdateLoading(false);

            console.log('error: ', error);
        }
    };

    const bulkVariantCreate = async (NewAddedVariant: any) => {
        try {
            const variantArr = NewAddedVariant?.map((item: any) => ({
                attributes: [],
                sku: item.sku,
                name: item.name,
                trackInventory: item.stackMgmt,
                channelListings: [
                    {
                        channelId: 'Q2hhbm5lbDoy',
                        price: item.regularPrice,
                        costPrice: item.regularPrice,
                    },
                ],
                stocks: [
                    {
                        warehouse: 'V2FyZWhvdXNlOmRmODMzODUzLTQyMGYtNGRkZi04YzQzLTVkMzdjMzI4MDRlYQ==',
                        quantity: item.stackMgmt ? item.quantity : 0,
                    },
                ],
            }));

            const { data } = await createVariant({
                variables: {
                    id: id,
                    inputs: variantArr,
                },
                // variables: { email: formData.email, password: formData.password },
            });

            if (data?.productVariantBulkCreate?.errors?.length > 0) {
                setUpdateLoading(false);
                Failure(data?.productVariantBulkCreate?.errors[0]?.message);
            } else {
                const resVariants = data?.productVariantBulkCreate?.productVariants;
                if (resVariants?.length > 0) {
                    resVariants?.map((item: any) => {
                        variantChannelListUpdate(item.id, NewAddedVariant);
                    });
                }
            }
        } catch (error) {
            setUpdateLoading(false);

            console.log('error: ', error);
        }
    };

    const variantChannelListUpdate = async (variantId: any, NewAddedVariant: any) => {
        try {
            const variantArr = NewAddedVariant?.map((item: any) => ({
                channelId: 'Q2hhbm5lbDoy',
                price: item.regularPrice,
                costPrice: item.regularPrice,
            }));

            const { data } = await updateVariantList({
                variables: {
                    id: variantId,
                    input: variantArr,
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productVariantChannelListingUpdate?.errors?.length > 0) {
                setUpdateLoading(false);
                Failure(data?.productVariantChannelListingUpdate?.errors[0]?.message);
            } else {
                updateMetaData();
            }
        } catch (error) {
            setUpdateLoading(false);

            console.log('error: ', error);
        }
    };

    const arr = [
        { type: 'design', designName: dropdowndata?.design },
        { type: 'style', styleName: dropdowndata?.style },
        { type: 'stone', stoneName: dropdowndata?.stoneType },
        { type: 'finish', finishName: dropdowndata?.finish },
        { type: 'stoneColor', stoneColorName: dropdowndata?.stoneColor },
        { type: 'type', typeName: dropdowndata?.type },
        { type: 'size', sizeName: dropdowndata?.size },
    ];

    const optionsVal = arr.map((item) => ({ value: item.type, label: item.type }));

    const handleAddAccordion = () => {
        // const selectedType = arr.find((item) => item.type === chooseType);
        // setSelectedArr([chooseType, ...selectedArr]);
        // setAccordions([selectedType, ...accordions]);
        // setOpenAccordion(chooseType);
        // setSelectedValues({ ...selectedValues, [chooseType]: [] }); // Clear selected values for the chosen type

        if (chooseType == '') {
            setAttDropDownError('Please select a type');
        } else {
            const selectedType = arr.find((item) => item?.type === chooseType);
            setSelectedArr([chooseType, ...selectedArr]);
            setAccordions([selectedType, ...accordions]);
            setOpenAccordion(chooseType);
            setSelectedValues({ ...selectedValues, [chooseType]: [] }); // Clear selected values for the chosen type
            setChooseType('');
            setAttDropDownError('');
        }
    };

    const handleRemoveAccordion = (type: any) => {
        setSelectedArr(selectedArr.filter((item: any) => item !== type));
        setAccordions(accordions.filter((item: any) => item.type !== type));
        setOpenAccordion('');
        const updatedSelectedValues = { ...selectedValues };
        delete updatedSelectedValues[type];
        setSelectedValues(updatedSelectedValues);
    };

    const handleDropdownChange = (event: any, type: any) => {
        setChooseType(type);
    };

    const handleToggleAccordion = (type: any) => {
        setOpenAccordion(openAccordion === type ? '' : type);
    };

    const handleMultiSelectChange = (selectedOptions: any, type: any) => {
        const selectedValuesForType = selectedOptions.map((option: any) => option.value);
        setSelectedValues({ ...selectedValues, [type]: selectedValuesForType });
    };

    const handleChange = (index: any, fieldName: any, fieldValue: any) => {
        setVariants((prevItems) => {
            const updatedItems: any = [...prevItems];
            updatedItems[index][fieldName] = fieldValue;
            return updatedItems;
        });
    };

    const handleAddItem = () => {
        setVariants((prevItems: any) => [
            ...prevItems,
            {
                sku: '',
                stackMgmt: false,
                quantity: 0,
                regularPrice: 0,
                salePrice: 0,
                channelId: '',
            },
        ]);
    };

    const handleRemoveVariants = async (item: any, index: any) => {
        try {
            if (item?.id) {
                const res = await deleteVarient({
                    variables: {
                        id: item?.id,
                    },
                });
            }
            if (index === 0) return; // Prevent removing the first item
            setVariants((prevItems) => prevItems.filter((_, i) => i !== index));
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleDragStart = (e: any, id: any, i: any) => {
        e.dataTransfer.setData('id', id);
        setDropIndex(id);
    };

    const handleDragOver = (e: any) => {
        e.preventDefault();
    };

    const handleDrop = async (e: any, targetIndex: any) => {
        e.preventDefault();
        const imageId = e.dataTransfer.getData('id');
        const newIndex = parseInt(targetIndex, 10);
        let draggedImageIndex = -1;
        for (let i = 0; i < images.length; i++) {
            if (images[i].id === dropIndex) {
                draggedImageIndex = i;
                break;
            }
        }

        if (draggedImageIndex !== -1) {
            const newImages = [...images];
            const [draggedImage] = newImages.splice(draggedImageIndex, 1);
            newImages.splice(newIndex, 0, draggedImage);
            setImages(newImages);
        }
    };

    const getProductForUpsells = async () => {
        try {
            const res = await productSearchRefetch({
                name: searchUpsells,
            });

            const response = res?.data?.products?.edges;
            const dropdownData = response?.map((item: any) => ({ value: item?.node?.id, label: item?.node?.name }));
            setProductListUpsell(dropdownData);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getProductForCrossell = async () => {
        try {
            const res = await productSearchRefetch({
                name: searchCrossell,
            });
            const response = res?.data?.products?.edges;
            const dropdownData = response?.map((item: any) => ({ value: item?.node?.id, label: item?.node?.name }));
            setProductListCrossell(dropdownData);
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
    const handleImageSelect = (item) => {
        setSelectedImages((prevSelectedImages) => {
            if (prevSelectedImages.includes(item)) {
                return prevSelectedImages.filter((image) => image !== item);
            } else {
                return [...prevSelectedImages, item];
            }
        });
    };

    const handleMouseDown = (item) => {
        longPressTimeout.current = setTimeout(() => {
            setIsLongPress(true);
            handleImageSelect(item);
        }, 500); // 500ms for long press
    };

    const handleMouseUp = () => {
        clearTimeout(longPressTimeout.current);
        setIsLongPress(false);
    };

    const handleMouseLeave = () => {
        clearTimeout(longPressTimeout.current);
        setIsLongPress(false);
    };

    const createMediaData = async (item) => {
        try {
            const { data } = await createMedia({
                variables: {
                    productId: id,
                    media_url: item,
                    alt: '',
                },
            });
            const resData = {
                id: data?.productMediaCreate?.media?.id,
                url: data?.productMediaCreate?.media?.url,
            };
            return resData;
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const newImageAdded = async () => {
        {
            let arr = [...images];
            const urls = selectedImages?.map((item) => item.url);
            urls.map(async (items) => {
                const { data } = await createMedia({
                    variables: {
                        productId: id,
                        media_url: items,
                        alt: '',
                    },
                });

                if (data?.productMediaCreate?.errors?.length > 0) {
                    Failure(data?.productMediaCreate?.errors[0]?.message);
                } else {
                    const resData = {
                        id: data?.productMediaCreate?.media?.id,
                        url: data?.productMediaCreate?.media?.url,
                    };
                    arr.push(resData);
                }
            });
            setImages(arr);
            setModal2(false);
            setSelectedImages([]);
            setSelectedImg({});
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

    const searchMediaByName = async (e) => {
        setMediaSearch(e);
        try {
            const res = await fetchImagesFromS3(e);
            if (mediaType == 'all') {
                setMediaImages(res);
            } else if (mediaType == 'image') {
                const response = imageFilter(res);
                setMediaImages(response);
            } else if (mediaType == 'video') {
                const response = videoFilter(res);
                setMediaImages(response);
            } else {
                const response = docFilter(res);
                setMediaImages(response);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const filterMediaByMonth = (value: any) => {
        setMediaMonth(value);
    };

    const getFullDetails = (selectedValues, arr) => {
        return Object.keys(selectedValues).reduce((acc, key) => {
            if (arr[key]) {
                acc[key] = arr[key].edges.filter((edge) => selectedValues[key].includes(edge.node.id)).map((edge) => edge.node);
            }
            return acc;
        }, {});
    };

    const previewClick = async () => {
        setPreviewLoading(true);
        const savedContent = await editorInstance?.save();

        const styleRes = await styleRefetch({
            sampleParams,
        });

        const designRes = await designRefetch({
            sampleParams,
        });

        const finishRes = await finishRefetch({
            sampleParams,
        });

        const stoneTypeRes = await stoneRefetch({
            sampleParams,
        });

        const stoneColorRes = await stoneColorRefetch({
            sampleParams,
        });

        const typeRes = await typeRefetch({
            sampleParams,
        });

        const sizeRes = await sizeRefetch({
            sampleParams,
        });
        let youMayLike = [];

        if (selectedCrosssell?.length > 0) {
            const listById = await productListRefetch({
                ids: selectedCrosssell?.map((item) => item?.value),
                channel: 'india-channel',
            });

            const modify = listById?.data?.products?.edges;
            if (modify.length > 0) {
                youMayLike = modify?.map((item) => ({
                    name: item?.node?.name,
                    image: item?.node?.thumbnail?.url,
                    price: item?.node?.pricing?.priceRange ? item?.node?.pricing?.priceRange?.start?.gross?.amount : 0,

                    // price: item?.node?.pricing?.priceRange?.start?.gross?.amount,
                }));
            }
        }

        const arr1 = {
            design: designRes?.data?.productDesigns,
            style: styleRes?.data?.productStyles,
            finish: finishRes?.data?.productFinishes,
            stoneType: stoneTypeRes?.data?.productStoneTypes,
            stoneColor: stoneColorRes?.data?.stoneColors,
            type: typeRes?.data?.itemTypes,
            size: sizeRes?.data?.sizes,
        };
        const attributes = getFullDetails(selectedValues, arr1);
        const idSet = new Set(selectedCat.map((item) => item.value));
        let parentCat = '';
        let relateProducts = [];

        // Step 2: Filter objects from the first array
        const result = parentList?.categories?.edges.filter((item) => idSet.has(item.node.id) && item.node.level === 0).map((item) => item.node);

        if (result.length > 0) {
            parentCat = result[0]?.id;
            const res = await relatedProductsRefetch({
                channel: 'india-channel',
                id: parentCat,
            });

            const response = res?.data?.category?.products?.edges;
            const filter = response?.filter((item) => item?.node?.id !== id);
            if (filter.length > 0) {
                relateProducts = filter?.map((item) => ({
                    name: item?.node?.name,
                    image: item?.node?.thumbnail?.url,
                    price: item?.node?.pricing?.priceRange ? item?.node?.pricing?.priceRange?.start?.gross?.amount : 0,
                }));
            }
        }
        let img = [];
        if (images?.length > 0) {
            img = images?.filter((item) => !item.url.endsWith('.mp4'));
        }
        const data = {
            name: productName,
            slug,
            seoTittle,
            seoDesc,
            shortDescription,
            description: savedContent,
            category: selectedCat,
            variants,
            collection: selectedCollection,
            tags: selectedTag,
            upsell: selectedUpsell,
            crossell: selectedCrosssell,
            publish,
            attributes,
            menuOrder,
            label,
            image: img,
            productId: id,
            relateProducts,
            youMayLike,
        };
        setPreviewData(data);
        setIsOpenPreview(true);
        setPreviewLoading(false);
    };

    return (
        <div>
            <div className="  mt-6">
                <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Edit Product</h5>

                    <div className="flex ltr:ml-auto rtl:mr-auto">
                        <button type="button" className="btn btn-primary" onClick={() => router.push('/apps/product/add')}>
                            + Create
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className=" col-span-9">
                        <div className="panel mb-5">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Product Name
                            </label>
                            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Enter Your Name" name="name" className="form-input" required />
                            {productNameErrMsg && <p className="error-message mt-1 text-red-500">{productNameErrMsg}</p>}
                        </div>
                        <div className="panel mb-5">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Slug
                            </label>
                            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Enter slug" name="name" className="form-input" required />
                            {slugErrMsg && <p className="error-message mt-1 text-red-500 ">{slugErrMsg}</p>}
                        </div>
                        <div className="panel mb-5">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                SEO
                            </label>
                            <input type="text" value={seoTittle} onChange={(e) => setSeoTittle(e.target.value)} placeholder="Enter title" name="name" className="form-input" required />
                            {seoTittleErrMsg && <p className="error-message mt-1 text-red-500 ">{seoTittleErrMsg}</p>}

                            <textarea
                                id="ctnTextarea"
                                value={seoDesc}
                                onChange={(e) => setSeoDesc(e.target.value)}
                                rows={3}
                                className="form-textarea mt-5"
                                placeholder="Enter Description"
                                required
                            ></textarea>
                            {seoDescErrMsg && <p className="error-message mt-1 text-red-500 ">{seoDescErrMsg}</p>}

                            <div className=" mt-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Keyword
                                </label>
                                <div className="">
                                    <textarea id="ctnTextarea" value={keyword} onChange={(e) => setKeyword(e.target.value)} rows={3} className="form-textarea " placeholder="Enter Keyword"></textarea>
                                </div>
                            </div>
                        </div>
                        {/* <div className="panel mb-5">
                            <label htmlFor="editor" className="block text-sm font-medium text-gray-700">
                                Product description
                            </label>
                            <ReactQuill id="editor" theme="snow" value={value} onChange={setValue} />
                        </div> */}
                        <div className="panel mb-5">
                            <label htmlFor="editor" className="block text-sm font-medium text-gray-700">
                                Product description
                            </label>
                            {/* <textarea
                                id="ctnTextarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className="form-textarea mt-5"
                                placeholder="Enter Description"
                                required
                            ></textarea> */}
                            {/* {seoDescErrMsg && <p className="error-message mt-1 text-red-500 ">{seoDescErrMsg}</p>} */}
                            <div className="" style={{ height: '250px', overflow: 'scroll' }}>
                                <div ref={editorRef} className="border border-r-8 border-gray-200"></div>
                            </div>
                            {descriptionErrMsg && <p className="error-message mt-1 text-red-500 ">{descriptionErrMsg}</p>}
                        </div>

                        <div className="panel mb-5">
                            <label htmlFor="editor" className="block text-sm font-medium text-gray-700">
                                Product Short description
                            </label>
                            <textarea
                                id="ctnTextarea"
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                rows={3}
                                className="form-textarea"
                                placeholder="Enter Short Description"
                                required
                            ></textarea>
                            {shortDesErrMsg && <p className="error-message mt-1 text-red-500 ">{shortDesErrMsg}</p>}
                        </div>
                        <div className="panel mb-5 ">
                            {/* <div className="mb-5 flex flex-col border-b border-gray-200 pb-5 pl-10 sm:flex-row">
                                <label htmlFor="name" className="mt-2 block  pr-5 text-sm font-semibold text-gray-700">
                                    Product Data
                                </label>
                                <select className="form-select" style={{ width: '200px' }}>
                                    <option value="1">Simple Product</option>
                                    <option value="2">Variable Product</option>
                                </select>
                            </div> */}
                            <div className="flex flex-col  md:flex-row">
                                {isMounted && (
                                    <Tab.Group>
                                        <div className="mx-10 mb-5 sm:mb-0">
                                            <Tab.List className="mb-5 flex w-32 flex-row text-center font-semibold  md:m-auto md:mb-0 md:flex-col ">
                                                {/* <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? '!bg-primary text-white !outline-none hover:text-white' : ''}
                                                        relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:h-[80%] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px] dark:border-[#191e3a]`}
                                                        >
                                                            General
                                                        </button>
                                                    )}
                                                </Tab> */}

                                                {/* <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? '!bg-primary text-white !outline-none hover:text-white' : ''}
                                                        relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:h-[80%] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px] dark:border-[#191e3a]`}
                                                        >
                                                            Linked Products
                                                        </button>
                                                    )}
                                                </Tab> */}
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? '!bg-primary text-white !outline-none hover:text-white' : ''}
                                                        relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:h-[80%] dark:border-[#191e3a] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px]`}
                                                        >
                                                            Variants
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? '!bg-primary text-white !outline-none hover:text-white' : ''}
                                                        relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:h-[80%] dark:border-[#191e3a] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px]`}
                                                        >
                                                            Attributes
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? '!bg-primary text-white !outline-none hover:text-white' : ''}
                                                        relative -mb-[1px] block w-full border-white-light p-3.5 py-4 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:h-[80%] dark:border-[#191e3a] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px]`}
                                                        >
                                                            Advanced
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? '!bg-primary text-white !outline-none hover:text-white' : ''}
                                                        relative -mb-[1px] block w-full border-white-light p-3.5 py-2 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:h-[80%] dark:border-[#191e3a] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px]`}
                                                        >
                                                            Linked Products
                                                        </button>
                                                    )}
                                                </Tab>
                                            </Tab.List>
                                        </div>
                                        <Tab.Panels className="w-full">
                                            {/* <Tab.Panel>
                                                <div className="active flex items-center">
                                                    <div className="mb-5 mr-4 pr-6">
                                                        <label htmlFor="upsells" className="block pr-5 text-sm font-medium text-gray-700">
                                                            Upsells
                                                        </label>
                                                    </div>
                                                    <div className="mb-5" style={{ width: '100%' }}>
                                                        <Select placeholder="Select an option" options={options} isMulti isSearchable={true} />
                                                    </div>
                                                </div>

                                                <div className="active flex items-center">
                                                    <div className="mb-5 mr-4">
                                                        <label htmlFor="cross-sells" className="block pr-5 text-sm font-medium text-gray-700">
                                                            Cross-sells
                                                        </label>
                                                    </div>
                                                    <div className="mb-5" style={{ width: '100%' }}>
                                                        <Select placeholder="Select an option" options={options} isMulti isSearchable={false} />
                                                    </div>
                                                </div>
                                            </Tab.Panel> */}
                                            <Tab.Panel>
                                                {variants?.map((item, index) => {
                                                    return (
                                                        <div key={index} className="mb-5 border-b border-gray-200">
                                                            {index !== 0 && ( // Render remove button only for items after the first one
                                                                <div className="active flex items-center justify-end text-danger">
                                                                    <button onClick={() => handleRemoveVariants(item, index)}>
                                                                        <IconTrashLines />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <div className="active flex items-center">
                                                                <div className="mb-5 mr-4" style={{ width: '20%' }}>
                                                                    <label htmlFor={`name${index}`} className="block pr-5 text-sm font-medium text-gray-700">
                                                                        Variant
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5" style={{ width: '80%' }}>
                                                                    <input
                                                                        type="text"
                                                                        id={`name${index}`}
                                                                        name={`name${index}`}
                                                                        value={item.name}
                                                                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Enter variants"
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="active flex items-center">
                                                                <div className="mb-5 mr-4" style={{ width: '20%' }}>
                                                                    <label htmlFor={`sku_${index}`} className="block pr-5 text-sm font-medium text-gray-700">
                                                                        SKU
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5" style={{ width: '80%' }}>
                                                                    <input
                                                                        type="text"
                                                                        id={`sku_${index}`}
                                                                        name={`sku_${index}`}
                                                                        value={item.sku}
                                                                        onChange={(e) => handleChange(index, 'sku', e.target.value)}
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Enter SKU"
                                                                        className="form-input"
                                                                    />
                                                                    {variantErrors[index]?.sku && <p className="error-message mt-1 text-red-500">{variantErrors[index].sku}</p>}

                                                                    {/* {skuErrMsg && <p className="error-message mt-1 text-red-500 ">{skuErrMsg}</p>} */}
                                                                </div>
                                                            </div>
                                                            <div className="active flex items-center">
                                                                <div className="mb-5 mr-4 pr-4" style={{ width: '20%' }}>
                                                                    <label htmlFor={`stackMgmt_${index}`} className="block  text-sm font-medium text-gray-700">
                                                                        Stock Management
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5" style={{ width: '80%' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`stackMgmt_${index}`}
                                                                        name={`stackMgmt_${index}`}
                                                                        checked={item.stackMgmt}
                                                                        onChange={(e) => handleChange(index, 'stackMgmt', e.target.checked)}
                                                                        className="form-checkbox"
                                                                    />
                                                                    <span>Track stock quantity for this product</span>
                                                                    {variantErrors[index]?.stackMgmt && <p className="error-message mt-1 text-red-500">{variantErrors[index].stackMgmt}</p>}
                                                                </div>
                                                            </div>
                                                            {/* {item.stackMgmt && ( */}
                                                            <div className="active flex items-center">
                                                                <div className="mb-5 mr-4 " style={{ width: '20%' }}>
                                                                    <label htmlFor={`quantity_${index}`} className="block  text-sm font-medium text-gray-700">
                                                                        Quantity
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5" style={{ width: '80%' }}>
                                                                    <input
                                                                        type="number"
                                                                        id={`quantity_${index}`}
                                                                        name={`quantity_${index}`}
                                                                        value={item?.quantity}
                                                                        onChange={(e) => handleChange(index, 'quantity', parseInt(e.target.value))}
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Enter Quantity"
                                                                        className="form-input"
                                                                    />
                                                                    {variantErrors[index]?.quantity && <p className="error-message mt-1 text-red-500">{variantErrors[index].quantity}</p>}
                                                                </div>
                                                            </div>
                                                            {/* )} */}
                                                            <div className="active flex items-center">
                                                                <div className="mb-5 mr-4" style={{ width: '20%' }}>
                                                                    <label htmlFor={`regularPrice_${index}`} className="block pr-5 text-sm font-medium text-gray-700">
                                                                        Regular Price
                                                                    </label>
                                                                </div>
                                                                <div className="mb-5" style={{ width: '80%' }}>
                                                                    <input
                                                                        type="number"
                                                                        id={`regularPrice_${index}`}
                                                                        name={`regularPrice_${index}`}
                                                                        value={item.regularPrice}
                                                                        onChange={(e) => handleChange(index, 'regularPrice', parseFloat(e.target.value))}
                                                                        style={{ width: '100%' }}
                                                                        placeholder="Enter Regular Price"
                                                                        className="form-input"
                                                                    />
                                                                    {variantErrors[index]?.regularPrice && <p className="error-message mt-1 text-red-500">{variantErrors[index].regularPrice}</p>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div className="mb-5">
                                                    <button type="button" className=" btn btn-primary flex justify-end" onClick={handleAddItem}>
                                                        Add item
                                                    </button>
                                                </div>
                                            </Tab.Panel>

                                            <Tab.Panel>
                                                <div className="active flex ">
                                                    <div className="mb-5 pr-3" style={{ width: '50%' }}>
                                                        <Select
                                                            placeholder="Select Type"
                                                            options={optionsVal.filter((option: any) => !selectedArr?.includes(option.value))}
                                                            onChange={(selectedOption: any) => handleDropdownChange(selectedOption, selectedOption.value)}
                                                            value={chooseType ? optionsVal.find((option) => option.value === chooseType) : null}

                                                            // value={options?.find((option) => option?.value === chooseType)} // Set the value of the selected type
                                                        />
                                                        {attDropDownError && <p className="error-message  text-red-500">{attDropDownError}</p>}
                                                    </div>
                                                    <div className="mb-5">
                                                        <button type="button" className="btn btn-outline-primary" onClick={handleAddAccordion}>
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mb-5">
                                                    <div className="space-y-2 font-semibold">
                                                        {accordions.map((item: any) => (
                                                            <div key={item?.type} className="rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
                                                                <button
                                                                    type="button"
                                                                    className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] ${active === '1' ? '!text-primary' : ''}`}
                                                                    // onClick={() => togglePara('1')}
                                                                >
                                                                    {item?.type}
                                                                    {/* <button onClick={() => handleRemoveAccordion(item.type)}>Remove</button> */}

                                                                    <div className={`text-red-400 ltr:ml-auto rtl:mr-auto `} onClick={() => handleRemoveAccordion(item.type)}>
                                                                        <IconTrashLines />
                                                                    </div>
                                                                </button>
                                                                <div>
                                                                    <AnimateHeight duration={300} height={active === '1' ? 'auto' : 0}>
                                                                        <div className="grid grid-cols-12 gap-4 border-t border-[#d3d3d3] p-4 text-[13px] dark:border-[#1b2e4b]">
                                                                            <div className="col-span-4">
                                                                                <p>
                                                                                    Name:
                                                                                    <br /> <span className="font-semibold">{item.type}</span>
                                                                                </p>
                                                                            </div>
                                                                            <div className="col-span-8">
                                                                                <div className="active ">
                                                                                    <div className=" mr-4 ">
                                                                                        <label htmlFor="value" className="block pr-5 text-sm font-medium text-gray-700">
                                                                                            Value(s)
                                                                                        </label>
                                                                                    </div>
                                                                                    <div className="mb-5" style={{ width: '100%' }}>
                                                                                        {/* <Select
                                                                                            placeholder={`Select ${item.type} Name`}
                                                                                            options={item[`${item.type}Name`]}
                                                                                            onChange={(selectedOptions) => handleMultiSelectChange(selectedOptions, item.type)}
                                                                                            isMulti
                                                                                            isSearchable={false}
                                                                                            value={(selectedValues[item.type] || []).map((value) => ({ value, label: value }))}
                                                                                        /> */}
                                                                                        <Select
                                                                                            placeholder={`Select ${item.type} Name`}
                                                                                            options={item[`${item.type}Name`]}
                                                                                            onChange={(selectedOptions) => handleMultiSelectChange(selectedOptions, item.type)}
                                                                                            isMulti
                                                                                            isSearchable={true}
                                                                                            value={(selectedValues[item.type] || []).map((value: any) => {
                                                                                                const options = item[`${item.type}Name`];
                                                                                                const option = options ? options.find((option: any) => option.value === value) : null;
                                                                                                return option ? { value: option.value, label: option.label } : null;
                                                                                            })}
                                                                                        />
                                                                                        {attributeError[item.type] && <p className="error-message mt-1 text-red-500">{attributeError[item.type]}</p>}

                                                                                        {/* <Select placeholder="Select an option" options={options} isMulti isSearchable={false} /> */}
                                                                                        {/* <div className="flex justify-between">
                                                                                        <div className="flex">
                                                                                            <button type="button" className="btn btn-outline-primary btn-sm mr-2 mt-1">
                                                                                                Select All
                                                                                            </button>
                                                                                            <button type="button" className="btn btn-outline-primary btn-sm mt-1">
                                                                                                Select None
                                                                                            </button>
                                                                                        </div>
                                                                                        <div>
                                                                                            <button type="button" className="btn btn-outline-primary btn-sm mt-1">
                                                                                                Create Value
                                                                                            </button>
                                                                                        </div>
                                                                                    </div> */}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </AnimateHeight>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* <div>
                                                    <button type="button" className="btn btn-primary">
                                                        Save Attributes
                                                    </button>
                                                </div> */}
                                            </Tab.Panel>

                                            <Tab.Panel>
                                                <div>
                                                    <div className="active flex items-center">
                                                        <div className="mb-5 mr-4 pr-3" style={{ width: '20%' }}>
                                                            <label htmlFor="regularPrice" className="block pr-5 text-sm font-medium text-gray-700">
                                                                Menu Order
                                                            </label>
                                                        </div>
                                                        <div className="mb-5" style={{ width: '80%' }}>
                                                            <input
                                                                type="number"
                                                                style={{ width: '100%' }}
                                                                value={menuOrder}
                                                                onChange={(e: any) => setMenuOrder(e.target.value)}
                                                                placeholder="Enter Menu Order"
                                                                name="regularPrice"
                                                                className="form-input"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Panel>

                                            <Tab.Panel>
                                                <div className="active flex items-center">
                                                    <div className="mb-5 mr-4 pr-6">
                                                        <label htmlFor="upsells" className="block pr-5 text-sm font-medium text-gray-700">
                                                            Upsells
                                                        </label>
                                                    </div>
                                                    <div className="mb-5" style={{ width: '100%' }}>
                                                        <Select
                                                            placeholder="Select an option"
                                                            value={selectedUpsell}
                                                            options={productListUpsell}
                                                            onChange={(e: any) => setSelectedUpsell(e)}
                                                            isMulti
                                                            isSearchable={true}
                                                            onInputChange={(inputValue) => setSearchUpsells(inputValue)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="active flex items-center">
                                                    <div className="mb-5 mr-4">
                                                        <label htmlFor="cross-sells" className="block pr-5 text-sm font-medium text-gray-700">
                                                            Cross-sells
                                                        </label>
                                                    </div>
                                                    <div className="mb-5 w-full">
                                                        <Select
                                                            placeholder="Select an option"
                                                            value={selectedCrosssell}
                                                            options={productListCrossell}
                                                            onChange={(e: any) => setSelectedCrosssell(e)}
                                                            isMulti
                                                            isSearchable={true}
                                                            onInputChange={(inputValue) => setSearchCrossell(inputValue)}
                                                        />
                                                    </div>
                                                </div>
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                )}
                            </div>
                        </div>
                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Collections</h5>
                            </div>
                            <div className="mb-5">
                                <Select placeholder="Select an collection" options={collectionList} value={selectedCollection} onChange={selectedCollections} isMulti isSearchable={true} />
                            </div>
                        </div>
                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Label</h5>
                            </div>
                            <div className="mb-5">
                                <Select placeholder="Select an label" options={options} value={label} onChange={(val) => setLabel(val)} isSearchable={true} />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <div className="panel">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Publish</h5>
                            </div>

                            <div className="active flex items-center">
                                <div className="mb-5 w-full pr-3">
                                    <select className="form-select  flex-1 " value={publish} onChange={(e) => setPublish(e.target.value)}>
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <button type="submit" className="btn btn-primary w-full " onClick={() => updateProducts()}>
                                    {updateLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-outline-primary w-full"
                                    onClick={() => {
                                        previewClick();
                                    }}
                                >
                                    {previewLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Preview'}
                                </button>
                            </div>
                        </div>

                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Gallery</h5>
                            </div>

                            <div className="grid grid-cols-12 gap-3">
                                {images?.map((item: any, index: any) => (
                                    <>
                                        <div
                                            key={item.id}
                                            className="h-15 w-15 relative col-span-4 overflow-hidden bg-black"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item.id, index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                        >
                                            {item?.url?.endsWith('.mp4') ? (
                                                <video controls src={item} className="h-full w-full object-cover">
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <img src={item?.url} alt="Product image" className=" h-full w-full" />
                                            )}

                                            <button className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white" onClick={() => multiImageDelete(item)}>
                                                <IconTrashLines />
                                            </button>
                                        </div>
                                    </>
                                ))}
                            </div>

                            <p
                                className="mt-5 cursor-pointer text-primary underline"
                                onClick={() => {
                                    setMediaTab(1);
                                    setModal2(true);
                                    setSelectedImg({});
                                }}
                            >
                                Add product gallery images
                            </p>
                        </div>

                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Categories</h5>
                            </div>
                            <div className="mb-5">
                                <Select isMulti value={selectedCat} onChange={(e) => selectCat(e)} options={categoryList} placeholder="Select categories..." className="form-select" />

                                {categoryErrMsg && <p className="error-message mt-1 text-red-500 ">{categoryErrMsg}</p>}
                            </div>
                        </div>

                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Tags</h5>
                            </div>
                            <div className="mb-5">
                                <Select placeholder="Select an tags" isMulti options={tagList} value={selectedTag} onChange={(data: any) => setSelectedTag(data)} isSearchable={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* product video popup */}
            <Transition appear show={modal1} as={Fragment}>
                <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
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
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">Product gallery video</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="m-5">
                                        {isMounted && (
                                            <Tab.Group>
                                                <Tab.List className="mt-3 flex w-44 flex-wrap justify-start space-x-2 border p-1  rtl:space-x-reverse">
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`${selected ? 'bg-primary text-white !outline-none' : ''}
                                                    ' -mb-[1px] block rounded p-3.5 py-2 hover:bg-primary hover:text-white`}
                                                            >
                                                                MP4
                                                            </button>
                                                        )}
                                                    </Tab>
                                                    <Tab as={Fragment}>
                                                        {({ selected }) => (
                                                            <button
                                                                className={`${selected ? 'bg-primary text-white !outline-none' : ''}
                                                    ' -mb-[1px] block rounded p-3.5 py-2 hover:bg-primary hover:text-white`}
                                                            >
                                                                Youtube
                                                            </button>
                                                        )}
                                                    </Tab>
                                                </Tab.List>
                                                <Tab.Panels>
                                                    <Tab.Panel>
                                                        <div className="active pt-5">
                                                            <label htmlFor="product-gallery-video" className="form-label mb-5 border-b  pb-3 text-gray-600">
                                                                MP4 video file
                                                            </label>
                                                            <input type="file" id="product-gallery-video" className="form-input" />
                                                            <span className="pt-5 text-sm text-gray-600">Upload a new or select (.mp4) video file from the media library.</span>
                                                        </div>
                                                        <button className="btn btn-primary mt-5">Save</button>
                                                    </Tab.Panel>
                                                    <Tab.Panel>
                                                        <div className="active pt-5">
                                                            <label htmlFor="product-gallery-video" className="form-label mb-5 border-b  pb-3 text-gray-600">
                                                                YouTube video URL
                                                            </label>
                                                            <input type="text" id="product-gallery-video" className="form-input" />
                                                            <span className="pt-5 text-sm text-gray-600">Example: https://youtu.be/LXb3EKWsInQ</span>
                                                        </div>
                                                        <button className="btn btn-primary mt-5">Save</button>
                                                    </Tab.Panel>
                                                </Tab.Panels>
                                            </Tab.Group>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* product img popup */}

            <Transition appear show={modal4} as={Fragment}>
                <Dialog as="div" open={modal4} onClose={() => setModal4(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
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
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between border-b bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">Product gallery Image</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal4(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="m-5 pt-5">
                                        {/* Input for selecting file */}
                                        <input type="file" id="product-gallery-image" className="form-input" onChange={multiImgUpload} />

                                        {/* Button to upload */}
                                        {/* <div className="flex justify-end">
                                            <button className="btn btn-primary mt-5" onClick={handleUpload}>
                                                Upload
                                            </button>
                                        </div> */}

                                        {/* Display preview of the selected image */}
                                        {/* {images?.length > 0 &&
                                            images?.map((item, index) => (
                                                <div className="mt-5 bg-[#f0f0f0] p-5">

                                                    <div
                                                        key={item.id}
                                                        className=" relative h-20 w-20 "
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, item.id)}
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) => handleDrop(e, index)}
                                                    >
                                                        <img src={item?.url} alt="Selected" className="h-full w-full object-cover " />


                                                        <button className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white" onClick={() => multiImageDelete(index)}>
                                                            <IconTrashLines />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))} */}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition appear show={modal2} as={Fragment}>
                <Dialog
                    as="div"
                    open={modal2}
                    onClose={() => {
                        setSelectedImg({});
                        setModal2(false);
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
                                                setModal2(false);
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
                                                    setMediaType('all');
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
                                                    getMediaImage();
                                                    setMediaType('all');
                                                    setMediaMonth('all'), setMediaSearch('');
                                                }}
                                                className={`${mediaTab == 1 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 before:inline-block `}
                                            >
                                                Media Library
                                            </button>
                                        </div>

                                        {mediaTab == 0 ? (
                                            loading ? (
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
                                        ) : loading ? (
                                            <CommonLoader />
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-12 pt-5">
                                                    <div className="col-span-9 h-[450px] overflow-y-scroll border-r border-gray-200 pr-5">
                                                        <div className="flex gap-4">
                                                            <div>
                                                                <div>Filter by type</div>
                                                                <div className="flex justify-between gap-3 pt-3">
                                                                    <div className="flex gap-3">
                                                                        {/* <select className="form-select w-40 flex-1"> */}
                                                                        <select className="form-select w-60 flex-1" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
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
                                                                        <select className="form-select w-60 flex-1" value={mediaMonth} onChange={(e) => filterMediaByMonth(e.target.value)}>
                                                                            {/* <select className="form-select w-40 flex-1" value={mediaDate} onChange={(e) => filterMediaByMonth(e.target.value)}> */}
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
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-6 gap-3 pt-5">
                                                            {mediaImages?.length > 0 ? (
                                                                mediaImages?.map((item) => (
                                                                    <div
                                                                        key={item.url}
                                                                        className={`flex h-[160px] w-[180px] overflow-hidden p-2 ${selectedImages.includes(item) ? 'border-4 border-blue-500' : ''}`}
                                                                        // className={`flex h-[200px] w-[200px] overflow-hidden   ${selectedImages.includes(item) ? 'border-4 border-blue-500' : ''}`}
                                                                        onMouseDown={() => handleMouseDown(item)}
                                                                        onMouseUp={handleMouseUp}
                                                                        onMouseLeave={handleMouseLeave}
                                                                        onClick={() => {
                                                                            setSelectedImg(item);
                                                                            if (!isLongPress) {
                                                                                handleImageSelect(item);
                                                                            }
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
                                                            {/* <div className="border-b border-gray-200 pb-5"> */}
                                                            <div className="">

                                                                <div>
                                                                    <p className="mb-2 text-lg font-semibold">ATTACHMENT DETAILS</p>
                                                                </div>

                                                                {selectedImg?.key?.endsWith('.mp4') ? (
                                                                    <video controls src={selectedImg.url} className="h-full w-full object-cover">
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                ) : selectedImg?.key?.endsWith('.pdf') ? (
                                                                    <Image src={pdf} alt="Loading..." />
                                                                ) : selectedImg?.key?.endsWith('.doc') ? (
                                                                    <Image src={docs} alt="Loading..." />
                                                                ) : (
                                                                    <img src={selectedImg.url} alt="" className="h-full w-full" />
                                                                )}
                                                                {/* {selectedImg?.url?.endsWith('.mp4') ? (
                                                                    <video controls src={selectedImg?.url} className="h-full w-full object-cover" style={{ height: '300px' }}>
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                ) : (
                                                                    <img src={selectedImg.url} alt="" className="h-full w-full" />
                                                                )} */}
                                                                <p className="mt-2 font-semibold">{selectedImg?.key}</p>
                                                                <p className="text-sm">{moment(selectedImg?.LastModified).format('MMM d, yyyy')}</p>
                                                                <p className="text-sm">{(selectedImg?.Size / 1024).toFixed(2)} KB</p>

                                                                {/* <p className="text-sm">1707 by 2560 pixels</p> */}
                                                                <a href="#" className="text-danger underline" onClick={() => deleteImage()}>
                                                                    Delete permanently
                                                                </a>
                                                            </div>
                                                            {/* <div className="pr-5">
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
                                                            </div> */}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-5 flex justify-end border-t border-gray-200 pt-5">
                                                    <button className="btn btn-primary" onClick={() => newImageAdded()}>
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

            {/* //Preview */}
            <Transition appear show={isOpenPreview} as={Fragment}>
                <Dialog as="div" open={isOpenPreview} onClose={() => setIsOpenPreview(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
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
                                <Dialog.Panel as="div" className="panel my-8 w-[70%] overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark" >
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">Preview</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setIsOpenPreview(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="flex justify-center h-full w-full gap-3">
                                        <div
                                            className="panel scrollbar-hide  flex h-[600px] w-2/12 flex-col items-center overflow-scroll"
                                            style={{ overflowY: 'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                        >
                                            {productPreview?.image?.length > 0 ? (
                                                <div className="overflow-auto">
                                                    {productPreview?.image?.map((item, index) => (
                                                        <div key={index} className="h-100 w-[200px] cursor-pointer overflow-hidden p-2" onClick={() => setPreviewSelectedImg(item?.url)}>
                                                            <img src={item?.url} alt="image" className="object-contain" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-100 w-[200px] cursor-pointer overflow-hidden p-2">
                                                    <img src={'/assets/images/placeholder.png'} alt="image" className="object-contain" />
                                                </div>
                                            )}
                                        </div>
                                        {productPreview?.image?.length > 0 ? (
                                            <div className="panel h-[500px] w-4/12">
                                                <img src={previewSelectedImg ? previewSelectedImg : productPreview?.image[0]?.url} alt="image" style={{ width: '100%', height: '100%' }} />
                                            </div>
                                        ) : (
                                            <div className="panel h-[500px] w-4/12">
                                                <img src={'/assets/images/placeholder.png'} alt="image" style={{ width: '100%', height: '100%' }} />
                                            </div>
                                        )}

                                        <div className="panel h-full w-5/12">
                                            {productPreview?.name && (
                                                <label htmlFor="name" className="block text-2xl font-medium text-gray-700">
                                                    {productPreview?.name}
                                                </label>
                                            )}
                                            {productPreview?.variants?.length > 0 && (
                                                <div className="flex flex-wrap gap-4">
                                                    {productPreview?.variants?.map(
                                                        (item, index) => (
                                                            // item?.salePrice !== 0 && (
                                                            <label key={index} htmlFor="name" className="block text-2xl font-medium text-gray-700">
                                                                ₹{addCommasToNumber(item?.salePrice)}
                                                            </label>
                                                        )
                                                        // )
                                                    )}
                                                </div>
                                            )}
                                            {productPreview?.shortDescription && (
                                                <label htmlFor="name" className="text-md block font-medium text-gray-700">
                                                    {productPreview?.shortDescription}
                                                </label>
                                            )}
                                            <div className=" w-full ">
                                                <div
                                                    style={{
                                                        borderBottom: '1px solid #EAEBED',
                                                        paddingBottom: '15px',
                                                        marginBottom: '15px',
                                                    }}
                                                >
                                                    {productPreview?.description?.blocks?.length > 0 && (
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <div className={`${productPreview?.description ? 'theme-color' : ''}`}>MAINTENANCE TIPS</div>
                                                            {/* <div>{productPreview.description ? '▲' : '▼'}</div> */}
                                                        </div>
                                                    )}
                                                    {productPreview?.description && (
                                                        <>
                                                            {productPreview?.description?.blocks?.map((block, index) => (
                                                                <div key={index} style={{ marginTop: '10px' }}>
                                                                    {block?.type === 'header' && <h5 style={{ fontWeight: '400' }}>{block?.data?.text}</h5>}
                                                                    {block.type === 'paragraph' && (
                                                                        <p style={{ color: 'gray', marginBottom: '5px' }}>
                                                                            {block.data.text && (
                                                                                <span
                                                                                    dangerouslySetInnerHTML={{
                                                                                        __html: block.data.text.includes('<b>') ? `<b>${block.data.text}</b>` : block.data.text,
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                    {block.type === 'list' && (
                                                                        <ul style={{ paddingLeft: '20px' }}>
                                                                            {block.data.items?.map((item, itemIndex) => (
                                                                                <li
                                                                                    key={itemIndex}
                                                                                    style={{ color: 'gray' }}
                                                                                    dangerouslySetInnerHTML={{
                                                                                        __html: item.includes('<b>') ? `<b>${item}</b>` : item,
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                                {productPreview?.attributes && (
                                                    <div
                                                        style={{
                                                            borderBottom: '1px solid #EAEBED',
                                                            paddingBottom: '15px',
                                                            marginBottom: '15px',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <div>ADDITIONAL INFORMATION</div>
                                                            {/* <div>▲</div> */}
                                                        </div>
                                                        <ul
                                                            style={{
                                                                listStyleType: 'none',
                                                                paddingTop: '10px',
                                                                gap: 5,
                                                            }}
                                                        >
                                                            {Object.keys(productPreview?.attributes).map((key) => {
                                                                const attribute = productPreview?.attributes[key];
                                                                // Determine the label based on the attribute key
                                                                let label;
                                                                switch (key) {
                                                                    case 'design':
                                                                        label = 'Design';
                                                                        break;
                                                                    case 'style':
                                                                        label = 'Style';
                                                                        break;
                                                                    case 'finish':
                                                                        label = 'Finish';
                                                                        break;
                                                                    case 'stoneColor':
                                                                        label = 'Stone Color';
                                                                        break;
                                                                    case 'type':
                                                                        label = 'Type';
                                                                        break;
                                                                    case 'size':
                                                                        label = 'Size';
                                                                        break;
                                                                    default:
                                                                        label = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize key if no specific label
                                                                        break;
                                                                }

                                                                return (
                                                                    <div className="flex flex-wrap gap-3" key={key}>
                                                                        <span style={{ fontWeight: 'bold' }}>{label} : </span>
                                                                        {attribute.map((item, index) => (
                                                                            <span key={item.id} style={{ marginRight: '3px', cursor: 'pointer' }}>
                                                                                {item.name}
                                                                                {index < attribute.length - 1 ? ', ' : ''}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}
                                                {productPreview?.variants?.length > 0 && productPreview?.variants[0]?.sku !== '' && (
                                                    <div className="flex flex-wrap gap-3">
                                                        <span style={{ fontWeight: 'bold' }}>SKU : </span>
                                                        {productPreview?.variants?.map((item, index) => (
                                                            <span key={item?.value} style={{ marginRight: '3px', cursor: 'pointer' }}>
                                                                {item?.sku}
                                                                {index < productPreview?.variants?.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {productPreview?.category?.length > 0 && (
                                                    <div className="flex flex-wrap  gap-3">
                                                        <span style={{ fontWeight: 'bold' }}>Categories : </span>
                                                        {productPreview?.category?.map((item, index) => (
                                                            <span key={item?.value} style={{ marginRight: '3px', cursor: 'pointer' }}>
                                                                {item?.label}
                                                                {index < productPreview?.category?.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {productPreview?.tags?.length > 0 && (
                                                    <div className="flex flex-wrap  gap-3 ">
                                                        <span style={{ fontWeight: 'bold' }}>Tags : </span>
                                                        {productPreview?.tags?.map((item, index) => (
                                                            <span key={item?.value} style={{ marginRight: '3px', cursor: 'pointer' }}>
                                                                {item?.label}
                                                                {index < productPreview?.tags?.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {productPreview?.youMayLike?.length > 0 && (
                                        <div className="p-5">
                                            <div className="mb-5  border-b border-gray-200 pb-2">
                                                <h5 className=" block text-lg font-medium text-gray-700">You May Also Like ..</h5>
                                            </div>
                                            <div className="flex gap-4 overflow-x-scroll">
                                                {productPreview?.youMayLike?.map((item, index) => (
                                                    <div className=" flex flex-col items-center ">
                                                        <div key={index} className="h-100 w-[200px] cursor-pointer overflow-hidden p-2" onClick={() => setPreviewSelectedImg(item?.url)}>
                                                            {item?.image ? (
                                                                <img src={item?.image} alt="image" className="object-contain" />
                                                            ) : (
                                                                <img src={'/assets/images/placeholder.png'} alt="image" className="object-contain" />
                                                            )}
                                                        </div>
                                                        <div>{item?.name}</div>
                                                        <div>₹{addCommasToNumber(item?.price)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {productPreview?.relateProducts?.length > 0 && (
                                        <div className="p-5">
                                            <div className="mb-5  border-b border-gray-200 pb-2">
                                                <h5 className=" block text-lg font-medium text-gray-700">Related Products</h5>
                                            </div>
                                            <div className="flex gap-4 overflow-x-scroll">
                                                {productPreview?.relateProducts?.map((item, index) => (
                                                    <div className=" flex flex-col items-center ">
                                                        <div key={index} className="h-100 w-[200px] cursor-pointer overflow-hidden p-2" onClick={() => setPreviewSelectedImg(item?.url)}>
                                                            {item?.image ? (
                                                                <img src={item?.image} alt="image" className="object-contain" />
                                                            ) : (
                                                                <img src={'/assets/images/placeholder.png'} alt="image" className="object-contain" />
                                                            )}
                                                        </div>
                                                        <div>{item?.name}</div>
                                                        <div>₹{addCommasToNumber(item?.price)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default PrivateRouter(ProductEdit);
