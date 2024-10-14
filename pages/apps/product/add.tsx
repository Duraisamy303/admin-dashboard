import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState, Fragment, useCallback, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';

import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import Select from 'react-select';
import pdf from '../../../public/assets/images/pdf.png';
import docs from '../../../public/assets/images/docs.jpg';

import { Tab } from '@headlessui/react';
import AnimateHeight from 'react-animate-height';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
    ASSIGN_TAG_PRODUCT,
    CHANNEL_LIST,
    COLLECTION_LIST,
    COLOR_LIST,
    CREATE_CATEGORY,
    CREATE_PRODUCT,
    CREATE_TAG,
    CREATE_VARIANT,
    DELETE_PRODUCTS,
    DESIGN_LIST,
    FINISH_LIST,
    PARENT_CATEGORY_LIST,
    PRODUCT_LIST_TAGS,
    PRODUCT_TYPE_LIST,
    SIZE_LIST,
    STONE_LIST,
    STYLE_LIST,
    TYPE_LIST,
    UPDATE_META_DATA,
    UPDATE_PRODUCT_CHANNEL,
    UPDATE_VARIANT_LIST,
    PRODUCT_BY_NAME,
    PRODUCT_MEDIA_CREATE_NEW,
    PRODUCT_LIST_BY_ID,
    RELATED_PRODUCT,
    ADD_NEW_MEDIA_IMAGE,
    UPDATE_MEDIA_IMAGE,
    DELETE_MEDIA_IMAGE,
    GET_MEDIA_IMAGE,
    MEDIA_PAGINATION,
    GET_ATTRIBUTE_BY_PRODUCT_TYPE,
    NEW_PARENT_CATEGORY_LIST,
} from '@/query/product';
import {
    Failure,
    Success,
    addCommasToNumber,
    addNewMediaFile,
    capitalizeFLetter,
    deleteImagesFromS3,
    formatOptions,
    getFileNameFromUrl,
    getFileType,
    getImageDimensions,
    getKey,
    getMonthNumber,
    months,
    resizeImage,
    resizingImage,
    sampleParams,
    showDeleteAlert,
} from '@/utils/functions';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import Modal from '@/components/Modal';
import IconLoader from '@/components/Icon/IconLoader';
import moment from 'moment';
import axios from 'axios';
import CommonLoader from '@/pages/elements/commonLoader';
import Image from 'next/image';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import CategorySelect from '@/components/CategorySelect';
import TagSelect from '@/components/TagSelect';

const ProductAdd = () => {
    const router = useRouter();

    const PAGE_SIZE = 24;

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Add New Product'));
    });

    const [modal1, setModal1] = useState(false);
    const [modal2, setModal2] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mediaSearch, setMediaSearch] = useState('');
    const [mediaTab, setMediaTab] = useState(0);
    const [keyword, setKeyword] = useState('');

    const [isMounted, setIsMounted] = useState(false); //tabs
    const [imageList, setImageList] = useState([]);
    const [mediaStartCussor, setMediaStartCussor] = useState('');
    const [mediaEndCursor, setMediaEndCursor] = useState('');
    const [mediaHasNextPage, setMediaHasNextPage] = useState(false);
    const [mediaPreviousPage, setMediaPreviousPage] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    });
    const [menuOrder, setMenuOrder] = useState(null);

    // ------------------------------------------New Data--------------------------------------------

    const [productName, setProductName] = useState('');
    const [slug, setSlug] = useState('');
    const [seoTittle, setSeoTittle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');

    const [shortDescription, setShortDescription] = useState('');

    const [selectedCollection, setSelectedCollection] = useState([]);
    const [tagList, setTagList] = useState([]);
    const [selectedTag, setSelectedTag] = useState([]);
    const [publish, setPublish] = useState('draft');
    const [modal4, setModal4] = useState(false);
    const [mediaMonth, setMediaMonth] = useState('all');
    const [mediaType, setMediaType] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentCategory: '',
    });

    //for accordiant
    // const [selectedArr, setSelectedArr] = useState<any>([]);
    // const [accordions, setAccordions] = useState<any>([]);
    // const [openAccordion, setOpenAccordion] = useState('');
    // const [attDropDownError, setAttDropDownError] = useState('');
    // const [chooseType, setChooseType] = useState('');
    const [selectedValues, setSelectedValues] = useState<any>({});

    // error message start
    const [productNameErrMsg, setProductNameErrMsg] = useState('');
    const [slugErrMsg, setSlugErrMsg] = useState('');
    const [seoTittleErrMsg, setSeoTittleErrMsg] = useState('');
    const [seoDescErrMsg, setSeoDescErrMsg] = useState('');
    const [shortDesErrMsg, setShortDesErrMsg] = useState('');
    const [categoryErrMsg, setCategoryErrMsg] = useState('');
    const [descriptionErrMsg, setDescriptionErrMsg] = useState('');
    const [attributeError, setAttributeError] = useState('');
    const [variantErrors, setVariantErrors] = useState<any>([]);
    const [createLoading, setCreateLoading] = useState(false);
    const [isLongPress, setIsLongPress] = useState(false);
    const [previewSelectedImg, setPreviewSelectedImg] = useState(null);
    const [isPreview, setIsPreview] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [isOpenPreview, setIsOpenPreview] = useState(false);
    const [productPreview, setPreviewData] = useState(null);
    const [monthNumber, setMonthNumber] = useState(null);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [attributesData, setAttributesData] = useState([]);
    // error message end
    // const [dropdowndata, setDropdownData] = useState<any>('');

    const [images, setImages] = useState<any>('');
    const [imageUrl, setImageUrl] = useState<any>('');

    const [variants, setVariants] = useState([
        {
            sku: '',
            stackMgmt: false,
            quantity: 0,
            regularPrice: 0,
            salePrice: 0,
            name: '',
        },
    ]);

    // ------------------------------------------New Data--------------------------------------------

    const [quantityTrack, setQuantityTrack] = useState(true);
    // const [parentLists, setParentLists] = useState([]);
    const [newCatParentLists, setNewCatParentLists] = useState([]);

    const [searchUpsells, setSearchUpsells] = useState('');
    const [searchCrossell, setSearchCrossell] = useState('');
    const [active, setActive] = useState<string>('1');
    // track stock
    const trackStock = (value: any) => {
        setQuantityTrack(!quantityTrack);
    };

    const options = [
        { value: 'new', label: 'New' },
        { value: 'hot', label: 'Hot' },
    ];

    // const arr = [
    //     { type: 'design', designName: dropdowndata?.design },
    //     { type: 'style', styleName: dropdowndata?.style },
    //     { type: 'stone', stoneName: dropdowndata?.stoneType },
    //     { type: 'finish', finishName: dropdowndata?.finish },
    //     { type: 'stoneColor', stoneColorName: dropdowndata?.stoneColor },
    //     { type: 'type', typeName: dropdowndata?.type },
    //     { type: 'size', sizeName: dropdowndata?.size },
    // ];

    // const optionsVal = arr.map((item) => ({ value: item.type, label: item.type }));

    // -------------------------------------New Added-------------------------------------------------------
    const { refetch: productListRefetch } = useQuery(PRODUCT_LIST_BY_ID);

    const { refetch: relatedProductsRefetch } = useQuery(RELATED_PRODUCT);

    // const { error, data: orderDetails } = useQuery(CHANNEL_LIST, {
    //     variables: sampleParams,
    // });
    // const { data: finishData, refetch: finishRefetch } = useQuery(FINISH_LIST, {
    //     variables: sampleParams,
    // });

    // const { data: stoneData, refetch: stoneRefetch } = useQuery(STONE_LIST, {
    //     variables: sampleParams,
    // });
    // const { data: designData, refetch: designRefetch } = useQuery(DESIGN_LIST, {
    //     variables: sampleParams,
    // });

    // const { data: styleData, refetch: styleRefetch } = useQuery(STYLE_LIST, {
    //     variables: sampleParams,
    // });
    // -----------------New --------------------------------
    // const { data: stoneColorData, refetch: stoneColorRefetch } = useQuery(COLOR_LIST, {
    //     variables: sampleParams,
    // });

    // const { data: typeData, refetch: typeRefetch } = useQuery(TYPE_LIST, {
    //     variables: sampleParams,
    // });

    // const { data: sizeData, refetch: sizeRefetch } = useQuery(SIZE_LIST, {
    //     variables: sampleParams,
    // });

    const { refetch: mediaRefetch } = useQuery(MEDIA_PAGINATION);

    const { data: getAttribute } = useQuery(GET_ATTRIBUTE_BY_PRODUCT_TYPE, {
        variables: {
            id: 'UHJvZHVjdFR5cGU6Mg==',
            firstValues: 100,
        },
    });

    const [addCategory] = useMutation(CREATE_CATEGORY);
    const [addTag] = useMutation(CREATE_TAG);

    const {
        data: parentList,
        error: parentListError,
        refetch: catListRefetch,
    } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    const { refetch: categorySearchRefetch } = useQuery(NEW_PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    const fetchCategories = async (variables) => {
        return await categorySearchRefetch(variables);
    };

    const fetchTag = async (variables) => {
        return await tagRefetch(variables);
    };

    const { data: productSearch, refetch: productSearchRefetch } = useQuery(PRODUCT_BY_NAME);

    const [addNewImages] = useMutation(ADD_NEW_MEDIA_IMAGE);
    const [updateImages, { loading: mediaUpdateLoading }] = useMutation(UPDATE_MEDIA_IMAGE);
    const [deleteImages] = useMutation(DELETE_MEDIA_IMAGE);

    const { data: customerData, refetch: customerListRefetch } = useQuery(MEDIA_PAGINATION, {
        variables: {
            first: PAGE_SIZE,
            after: null,
            fileType: mediaType == 'all' ? '' : mediaType,
            month: 9,
            year: 2024,
            name: '',
        },
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                first: PAGE_SIZE,
                after: mediaEndCursor,
                before: null,
                fileType: mediaType == 'all' ? '' : mediaType,
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
                fileType: mediaType == 'all' ? '' : mediaType,
                month: monthNumber,
                year: 2024,
                name: mediaSearch,
            },
        });
    };

    const commonPagination = (data) => {
        setImageList(data.files.edges);
        setMediaStartCussor(data.files.pageInfo.startCursor);
        setMediaEndCursor(data.files.pageInfo.endCursor);
        setMediaHasNextPage(data.files.pageInfo.hasNextPage);
        setMediaPreviousPage(data.files.pageInfo.hasPreviousPage);
    };

    // useEffect(() => {
    //     const arr1 = {
    //         design: designData?.productDesigns,
    //         style: styleData?.productStyles,
    //         finish: finishData?.productFinishes,
    //         stoneType: stoneData?.productStoneTypes,
    //         stoneColor: stoneColorData?.stoneColors,
    //         type: typeData?.itemTypes,
    //         size: sizeData?.sizes,
    //     };

    //     const singleObj = Object.entries(arr1).reduce((acc: any, [key, value]) => {
    //         acc[key] = value?.edges.map(({ node }: any) => ({ value: node?.id, label: node?.name }));
    //         return acc;
    //     }, {});

    //     setDropdownData(singleObj);
    // }, [finishData, stoneData, designData, styleData, stoneColorData, typeData, sizeData]);

    useEffect(() => {
        getAttributeList();
    }, [getAttribute]);

    const getAttributeList = async () => {
        try {
            setAttributesData(getAttribute?.productType?.productAttributes);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    useEffect(() => {
        const getparentCategoryList = parentList?.categories?.edges;
        // const options = formatOptions(getparentCategoryList);
        setNewCatParentLists(getparentCategoryList);
    }, [parentList]);

    useEffect(() => {
        getProductForUpsells();
    }, [searchUpsells]);

    useEffect(() => {
        getProductForCrossell();
    }, [searchCrossell]);

    const { data: tagsList, refetch: tagListRefetch } = useQuery(PRODUCT_LIST_TAGS, {
        variables: { channel: 'india-channel', first: 100 },
    });

    const { refetch: tagRefetch, loading: tagloading } = useQuery(PRODUCT_LIST_TAGS);

    const { data: collection_list } = useQuery(COLLECTION_LIST, {
        variables: sampleParams,
    });

    const { data: productTypelist } = useQuery(PRODUCT_TYPE_LIST, {
        variables: sampleParams,
    });

    const [addFormData, { loading: createLoad }] = useMutation(CREATE_PRODUCT);
    const [deleteProducts, { loading: deleteLoad }] = useMutation(DELETE_PRODUCTS);
    const [updateProductChannelList, { loading: channelLoad }] = useMutation(UPDATE_PRODUCT_CHANNEL);
    const [createVariant, { loading: createVariantLoad }] = useMutation(CREATE_VARIANT);
    const [updateVariantList, { loading: updateVariantLoad }] = useMutation(UPDATE_VARIANT_LIST);
    const [updateMedatData, { loading: updateMedaLoad }] = useMutation(UPDATE_META_DATA);
    // const [assignTagToProduct] = useMutation(ASSIGN_TAG_PRODUCT);
    const [createMedia] = useMutation(PRODUCT_MEDIA_CREATE_NEW);

    const { data, refetch: getListRefetch } = useQuery(GET_MEDIA_IMAGE);

    const [collectionList, setCollectionList] = useState([]);
    const [label, setLabel] = useState<any>('');

    const [productType, setProductType] = useState([]);
    const [selectedCat, setselectedCat] = useState<any>([]);
    const [isOpenCat, setIsOpenCat] = useState(false);
    const [isOpenTag, setIsOpenTag] = useState(false);
    const [tagLoader, setTagLoader] = useState(false);
    const [productListUpsell, setProductListUpsell] = useState([]);
    const [productListCrossell, setProductListCrossell] = useState([]);
    const [selectedUpsell, setSelectedUpsell] = useState([]);
    const [selectedCrosssell, setSelectedCrosssell] = useState([]);
    const [mediaImages, setMediaImages] = useState([]);
    const [selectedImg, setSelectedImg] = useState(null);
    const [alt, setAlt] = useState('');
    const [caption, setCaption] = useState('');
    const [mediaData, setMediaData] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const longPressTimeout = useRef(null);

    const [createCategoryLoader, setCreateCategoryLoader] = useState(false);

    useEffect(() => {
        tags_list();
    }, [tagsList]);

    useEffect(() => {
        collections_list();
    }, [collection_list]);

    useEffect(() => {
        productsType();
    }, [productTypelist]);

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
        } catch (error) {}
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
        } catch (error) {}
    };

    // -------------------------EDITOR---------------------------------------
    const editorRef = useRef(null);
    const [editorInstance, setEditorInstance] = useState(null);
    const [content, setContent] = useState('');
    const [value, setValue] = useState<any>({
        time: Date.now(),
        blocks: [],
        version: '2.19.0',
    });

    let editors = { isReady: false };

    useEffect(() => {
        if (!editors.isReady) {
            editor();
            editors.isReady = true;
        }

        return () => {
            if (editorInstance) {
                editorInstance?.blocks?.clear();
            }
        };
    }, [value]);

    const editor = useCallback(() => {
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
    }, [editorInstance, value]);

    const selectedCollections = (data: any) => {
        setSelectedCollection(data);
    };

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required('Name is required'),
    });

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
        const savedContent = await editorInstance.save();

        // const styleRes = await styleRefetch({
        //     sampleParams,
        // });

        // const designRes = await designRefetch({
        //     sampleParams,
        // });

        // const finishRes = await finishRefetch({
        //     sampleParams,
        // });

        // const stoneTypeRes = await stoneRefetch({
        //     sampleParams,
        // });

        // const stoneColorRes = await stoneColorRefetch({
        //     sampleParams,
        // });

        // const typeRes = await typeRefetch({
        //     sampleParams,
        // });

        // const sizeRes = await sizeRefetch({
        //     sampleParams,
        // });
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
                }));
            }
        }

        // const arr1 = {
        //     design: designRes?.data?.productDesigns,
        //     style: styleRes?.data?.productStyles,
        //     finish: finishRes?.data?.productFinishes,
        //     stoneType: stoneTypeRes?.data?.productStoneTypes,
        //     stoneColor: stoneColorRes?.data?.stoneColors,
        //     type: typeRes?.data?.itemTypes,
        //     size: sizeRes?.data?.sizes,
        // };
        // const attributes = getFullDetails(selectedValues, arr1);

        const att = attributesData
            .map((attr) => {
                const selectedValues = selectedAttributes[attr?.id] || [];
                return selectedValues.length > 0
                    ? {
                          id: attr?.id,
                          values: selectedValues,
                          name: attr?.name || null,
                      }
                    : null;
            })
            .filter(Boolean);

        console.log('att: ', att);

        const attributes = att;

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
            if (response.length > 0) {
                relateProducts = response?.map((item) => ({
                    name: item?.node?.name,
                    image: item?.node?.thumbnail?.url,
                    price: item?.node?.pricing?.priceRange ? item?.node?.pricing?.priceRange?.start?.gross?.amount : 0,
                }));
            }
        }
        let img = [];
        if (imageUrl?.length > 0) {
            img = imageUrl?.filter((item) => !item.endsWith('.mp4'));
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
            // productId: id,
            relateProducts,
            youMayLike,
        };

        setPreviewData(data);
        setIsOpenPreview(true);
        setPreviewLoading(false);
    };

    const CreateProduct = async () => {
        try {
            const savedContent = await editorInstance.save();
            const descr = JSON.stringify(savedContent, null, 2);

            const att = attributesData
                .map((attr) => {
                    const selectedValues = selectedAttributes[attr?.id] || [];
                    return selectedValues.length > 0
                        ? {
                              id: attr?.id,
                              values: selectedValues,
                          }
                        : null;
                })
                .filter(Boolean);

            let errors = null;
            let variantErrors = null;

            // let attributeErrors = null;
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
            errors = validateMainFields(JSON.parse(descr));
            variantErrors = validateVariants();
            // attributeErrors = validateAttributes();

            // Set errors
            if (publish !== 'draft') {
                setProductNameErrMsg(errors.productName);
                setSlugErrMsg(errors.slug);
                setSeoTittleErrMsg(errors.seoTittle);
                setSeoDescErrMsg(errors.seoDesc);
                setDescriptionErrMsg(errors.description);
                setShortDesErrMsg(errors.shortDescription);
                setCategoryErrMsg(errors.category);
                setVariantErrors(variantErrors);

                // if (Object.keys(attributeErrors).length > 0) {
                //     setAttributeError(attributeErrors);
                // }
                if (Object.values(errors).some((msg) => msg !== '') || variantErrors.some((err) => Object.keys(err).length > 0)) {
                    setCreateLoading(false);
                    Failure('Please fill in all required fields');
                    // Exit if any error exists
                } else {
                    const tagId = selectedTag?.map((item) => item.value) || [];

                    let upsells = [];
                    if (selectedUpsell?.length > 0) {
                        upsells = selectedUpsell?.map((item) => item?.value);
                    }

                    let crosssells = [];
                    if (selectedCrosssell?.length > 0) {
                        crosssells = selectedCrosssell?.map((item) => item?.value);
                    }

                    // Submit data
                    const { data } = await addFormData({
                        variables: {
                            input: {
                                description: descr,
                                attributes: att,
                                category: selectedCat?.map((item) => item?.value),
                                collections: [],
                                tags: tagId,
                                name: productName,
                                productType: 'UHJvZHVjdFR5cGU6Mg==',
                                upsells,
                                crosssells,
                                seo: {
                                    description: seoDesc,
                                    title: seoTittle,
                                },
                                slug: slug,
                                order_no: menuOrder,
                                // ...(selectedValues && selectedValues.design && { prouctDesign: selectedValues.design }),
                                // ...(selectedValues && selectedValues.style && { productstyle: selectedValues.style }),
                                // ...(selectedValues && selectedValues.finish && { productFinish: selectedValues.finish }),
                                // ...(selectedValues && selectedValues.stone && { productStoneType: selectedValues.stone }),
                                // ...(selectedValues && selectedValues.type && { productItemtype: selectedValues.type }),
                                // ...(selectedValues && selectedValues.size && { productSize: selectedValues.size }),
                                // ...(selectedValues && selectedValues.stoneColor && { productStonecolor: selectedValues.stoneColor }),
                            },
                        },
                    });

                    if (data?.productCreate?.errors?.length > 0) {
                        setCreateLoading(false);
                        Failure(data?.productCreate?.errors[0]?.message);
                    } else {
                        const productId = data?.productCreate?.product?.id;
                        productChannelListUpdate(productId);
                        if (imageUrl?.length > 0) {
                            imageUrl.forEach(async (item) => {
                                createMediaData(productId, item);
                            });
                        }
                    }
                }
            } else {
                if (Object.values(errors).some((msg) => msg !== '')) {
                    setCreateLoading(false);
                    setProductNameErrMsg(errors.productName);
                    Failure('Please fill in all required fields');
                    return; // Exit if any error exists
                } else {
                    // Check if any error exists

                    // Prepare data for submission
                    // const collectionId = selectedCollection?.map((item) => item.value) || [];
                    const tagId = selectedTag?.map((item) => item.value) || [];

                    let upsells = [];
                    if (selectedUpsell?.length > 0) {
                        upsells = selectedUpsell?.map((item) => item?.value);
                    }

                    let crosssells = [];
                    if (selectedCrosssell?.length > 0) {
                        crosssells = selectedCrosssell?.map((item) => item?.value);
                    }

                    // Submit data
                    const { data } = await addFormData({
                        variables: {
                            input: {
                                description: descr,
                                attributes: att,
                                category: selectedCat?.map((item) => item?.value),
                                collections: [],
                                tags: tagId,
                                name: productName,
                                productType: 'UHJvZHVjdFR5cGU6Mg==',
                                upsells,
                                crosssells,
                                seo: {
                                    description: seoDesc,
                                    title: seoTittle,
                                },
                                slug: slug,
                                // ...(menuOrder && menuOrder > 0 && { order_no: menuOrder }),
                                order_no: menuOrder,

                                // ...(selectedValues && selectedValues.design && { prouctDesign: selectedValues.design }),
                                // ...(selectedValues && selectedValues.style && { productstyle: selectedValues.style }),
                                // ...(selectedValues && selectedValues.finish && { productFinish: selectedValues.finish }),
                                // ...(selectedValues && selectedValues.stone && { productStoneType: selectedValues.stone }),
                                // ...(selectedValues && selectedValues.type && { productItemtype: selectedValues.type }),
                                // ...(selectedValues && selectedValues.size && { productSize: selectedValues.size }),
                                // ...(selectedValues && selectedValues.stoneColor && { productStonecolor: selectedValues.stoneColor }),
                            },
                        },
                    });

                    if (data?.productCreate?.errors?.length > 0) {
                        setCreateLoading(false);
                        Failure(data?.productCreate?.errors[0]?.message);
                    } else {
                        const productId = data?.productCreate?.product?.id;
                        productChannelListUpdate(productId);
                        if (imageUrl?.length > 0) {
                            imageUrl.forEach(async (item) => {
                                createMediaData(productId, item);
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Error: ', error);
            setCreateLoading(false);
        }
    };

    const validateMainFields = (savedContent) => {
        let errors = null;
        if (publish !== 'draft') {
            errors = {
                productName: productName.trim() === '' ? 'Product name cannot be empty' : '',
                slug: slug.trim() === '' ? 'Slug cannot be empty' : '',
                seoTittle: seoTittle.trim() === '' ? 'Seo title cannot be empty' : '',
                seoDesc: seoDesc.trim() === '' ? 'Seo description cannot be empty' : '',
                description: savedContent?.blocks?.length === 0 ? 'Description cannot be empty' : '',
                shortDescription: shortDescription?.trim() === '' ? 'Short description cannot be empty' : '',
                category: selectedCat?.length === 0 ? 'Category cannot be empty' : '',
            };
        } else {
            errors = {
                productName: productName.trim() === '' ? 'Product name cannot be empty' : '',
            };
        }

        return errors;
    };

    // Helper function to validate variants
    const validateVariants = () => {
        return variants.map((variant) => {
            const errors: any = {};
            if (!variant.sku) errors.sku = 'SKU cannot be empty';
            // if (variant.quantity <= 0 || isNaN(variant.quantity)) errors.quantity = 'Quantity must be a valid number and greater than 0';
            if (variant.regularPrice <= 0 || isNaN(variant.regularPrice)) errors.regularPrice = 'Price must be a valid number and greater than 0';
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

    const productChannelListUpdate = async (productId: any) => {
        try {
            const { data } = await updateProductChannelList({
                variables: {
                    id: productId,
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
                setCreateLoading(false);
                Failure(data?.productChannelListingUpdate?.errors[0]?.message);
                deleteProduct(productId);
            } else {
                variantListUpdate(productId);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const variantListUpdate = async (productId: any) => {
        try {
            const variantArr = variants?.map((item) => ({
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
                        quantity: item.quantity,
                    },
                ],
            }));

            const { data } = await createVariant({
                variables: {
                    id: productId,
                    inputs: variantArr,
                },
                // variables: { email: formData.email, password: formData.password },
            });

            if (data?.productVariantBulkCreate?.errors?.length > 0) {
                setCreateLoading(false);
                Failure(data?.productVariantBulkCreate?.errors[0]?.message);
                deleteProduct(productId);
            } else {
                const resVariants = data?.productVariantBulkCreate?.productVariants;
                // if (resVariants?.length > 0) {
                //     resVariants?.map((item: any) => {
                //         variantChannelListUpdate(productId, item.id);
                //     });
                // }

                if (resVariants?.length > 0) {
                    const mergedVariants = variants.map((variant: any, index: number) => ({
                        ...variant,
                        variantId: resVariants[index]?.id || null,
                    }));
                    mergedVariants?.map((item) => variantChannelListUpdate(item?.regularPrice, productId, item.variantId));
                } else {
                    updateMetaData(productId);
                }

                // updateMetaData(productId);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const variantChannelListUpdate = async (price: any, productId: any, variantId: any) => {
        try {
            const { data } = await updateVariantList({
                variables: {
                    id: variantId,
                    input: [
                        {
                            channelId: 'Q2hhbm5lbDoy',
                            price: price,
                            costPrice: price,
                        },
                    ],
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.productVariantChannelListingUpdate?.errors?.length > 0) {
                Failure(data?.productVariantChannelListingUpdate?.errors[0]?.message);
                deleteProduct(productId);
            } else {
                updateMetaData(productId);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateMetaData = async (productId: any) => {
        try {
            const input = [];
            input.push({
                key: 'short_description',
                value: shortDescription,
            });
            input.push({
                key: 'keyword',
                value: keyword,
            });
            if (label?.value) {
                input.push({
                    key: 'label',
                    value: label.value,
                });
            }

            const { data } = await updateMedatData({
                variables: {
                    id: productId,
                    input,
                    keysToDelete: [],
                },
                // variables: { email: formData.email, password: formData.password },
            });
            if (data?.updateMetadata?.errors?.length > 0) {
                setCreateLoading(false);
                Failure(data?.updateMetadata?.errors[0]?.message);
                deleteProduct(productId);
            } else {
                // if (selectedTag?.length > 0) {
                //     assignsTagToProduct(productId);
                //     console.log('success: ', data);
                // }
                Success('Product created successfully');
                router.push(`/apps/product/edit?id=${productId}`);
            }
        } catch (error) {
            setCreateLoading(false);
            console.log('error: ', error);
        }
    };

    const createMediaData = async (productId: any, item: any) => {
        try {
            const { data } = await createMedia({
                variables: {
                    productId,
                    media_url: item,
                    alt: '',
                },
            });
        } catch (error) {
            setCreateLoading(false);
            console.log('error: ', error);
        }
    };

    const deleteProduct = (productId: any) => {
        const { data }: any = deleteProducts({
            variables: {
                ids: [productId],
            },
        });
    };

    // form submit
    const createNewCategory = async () => {
        try {
            if (formData.name == '') {
                Failure('Category name is required');
                return;
            }
            setCreateCategoryLoader(true);

            const Description = JSON.stringify({ time: Date.now(), blocks: [{ id: 'some-id', data: { text: formData.description }, type: 'paragraph' }], version: '2.24.3' });

            const variables = {
                input: {
                    name: formData.name,
                    description: Description,
                },
                parent: formData.parentCategory,
            };

            const { data } = await addCategory({ variables });
            if (data?.categoryCreate?.errors?.length > 0) {
                Failure(data?.categoryCreate?.errors[0].message);
                setCreateCategoryLoader(false);
            } else {
                catListRefetch();
                setIsOpenCat(false);
                setCreateCategoryLoader(false);
                Success('Category created successfully');
                setselectedCat({ label: data?.categoryCreate?.category?.name, value: data?.categoryCreate?.category?.id });
                setFormData({
                    name: '',
                    description: '',
                    parentCategory: '',
                });
            }
        } catch (error) {
            console.log('error: ', error);
            setCreateCategoryLoader(false);
        }
    };

    // const handleAddAccordion = () => {
    //     if (chooseType == '') {
    //         setAttDropDownError('Please select a type');
    //     } else {
    //         const selectedType = arr.find((item) => item?.type === chooseType);
    //         setSelectedArr([chooseType, ...selectedArr]);
    //         setAccordions([selectedType, ...accordions]);
    //         setOpenAccordion(chooseType);
    //         setSelectedValues({ ...selectedValues, [chooseType]: [] }); // Clear selected values for the chosen type
    //         setChooseType('');
    //         setAttDropDownError('');
    //     }
    // };

    // const handleRemoveAccordion = (type: any) => {
    //     setSelectedArr(selectedArr.filter((item: any) => item !== type));
    //     setAccordions(accordions.filter((item: any) => item.type !== type));
    //     setOpenAccordion('');
    //     const updatedSelectedValues: any = { ...selectedValues };
    //     delete updatedSelectedValues[type];
    //     setSelectedValues(updatedSelectedValues);
    // };

    // const handleDropdownChange = (event: any, type: any) => {
    //     setChooseType(type);
    // };

    // const handleMultiSelectChange = (selectedOptions: any, type: any) => {
    //     const selectedValuesForType = selectedOptions.map((option: any) => option.value);
    //     setSelectedValues({ ...selectedValues, [type]: selectedValuesForType });
    // };

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
            },
        ]);
    };

    const handleRemoveVariants = (index: any) => {
        if (index === 0) return; // Prevent removing the first item
        setVariants((prevItems) => prevItems.filter((_, i) => i !== index));
    };

    const multiImgUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile: any = event.target.files[0];
        const imageUrl = URL.createObjectURL(selectedFile);

        // Push the selected file into the 'images' array
        setImages((prevImages: any) => [...prevImages, selectedFile]);

        // Push the blob URL into the 'imageUrl' array
        setImageUrl((prevUrls: any) => [...prevUrls, imageUrl]);

        setModal4(false);
    };

    // -------------------------------------New Added-------------------------------------------------------

    const handleRemoveImage = (indexToRemove: any) => {
        setImageUrl((prevImageUrl: any) => prevImageUrl.filter((_: any, index: any) => index !== indexToRemove));
    };

    const createTags = async (record: any, { resetForm }: any) => {
        try {
            setTagLoader(true);
            const Description = JSON.stringify({ time: Date.now(), blocks: [{ id: 'some-id', data: { text: record.description }, type: 'paragraph' }], version: '2.24.3' });

            const variables = {
                input: {
                    name: record.name,
                },
            };

            const { data } = await addTag({ variables });
            setIsOpenTag(false);
            resetForm();
            tagListRefetch();
            setTagLoader(false);
            Success('Tag created successfully');
            setSelectedTag([{ value: data?.tagCreate?.tag?.id, label: data?.tagCreate?.tag?.name }]);
        } catch (error) {
            setTagLoader(false);

            console.log('error: ', error);
        }
    };

    const handleCatChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
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

    const multiImageDelete = async () => {
        showDeleteAlert(deleteImage, () => {
            Swal.fire('Cancelled', 'Your Image List is safe :)', 'error');
        });
    };

    const deleteImage = async () => {
        try {
            const key = getFileNameFromUrl(selectedImg);
            // Delete image from S3
            await deleteImagesFromS3(key);
            // Delete image record in the database
            await deleteImages({ variables: { file_url: selectedImg } });
            // Refresh the data
            await refresh();

            // Clear the selected image
            setSelectedImg(null);

            // Update the selectedImages array by removing the deleted image
            if (selectedImages?.length > 0) {
                const updatedSelectedImages = selectedImages.filter((item) => item.node.fileUrl !== selectedImg);
                // Update state with the remaining images
                setSelectedImages(updatedSelectedImages);
            }

            // Show success message
            Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(selectedImg).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
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
                        description: description,
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
        }, 1); // 100ms for long press
    };

    const handleMouseUp = () => {
        clearTimeout(longPressTimeout.current);
        setIsLongPress(false);
    };

    const handleMouseLeave = () => {
        clearTimeout(longPressTimeout.current);
        setIsLongPress(false);
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

    useEffect(() => {
        filterByType();
    }, [monthNumber]);

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
                fileType: mediaType == 'all' ? '' : mediaType,
                month: month,
                year: 2024,
                name,
            },
        };
        return input;
    };

    const filterMediaByMonth = async (value: any) => {
        setMediaMonth(value);
        const res = getMonthNumber(value);
        setMonthNumber(res);
    };

    const filterMediaByType = (e) => {
        setMediaType(e);
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
            setMediaData({ size: `${parseFloat(result?.size)?.toFixed(2)} KB`, lastModified: item.LastModified });
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
        if (imageUrl?.length > 0) {
            setImageUrl([...imageUrl, response.data?.fileCreate?.file?.fileUrl]);
        } else {
            setImageUrl([response.data?.fileCreate?.file?.fileUrl]);
        }

        await refresh();
        setMediaTab(1);
        Success('File added successfully');
    };

    const refresh = async () => {
        try {
            const res = await mediaRefetch({
                first: PAGE_SIZE,
                after: null,
                fileType: '',
                month: null,
                year: null,
                name: '',
            });

            commonPagination(res.data);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    useEffect(() => {
        if (mediaType == 'all') {
            refresh();
        }
    }, [mediaType]);

    const handleSelectChange = (attributeId, selectedOptions) => {
        // Ensure slug is used in place of value or label for state
        const selectedValues = selectedOptions.map((option) => option.slug); // Access slug here
        setSelectedAttributes((prev) => ({
            ...prev,
            [attributeId]: selectedValues, // Store slugs in the state
        }));
    };

    return (
        <div>
            <div className="mt-6">
                <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Add New Product</h5>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className=" col-span-12 md:col-span-9">
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
                            <label htmlFor="name" className="mt-5 block text-sm font-medium text-gray-700">
                                Keyword
                            </label>
                            <div className="">
                                <textarea id="ctnTextarea" value={keyword} onChange={(e) => setKeyword(e.target.value)} rows={3} className="form-textarea " placeholder="Enter Keyword"></textarea>
                            </div>
                        </div>
                        <div className="panel mb-5 mt-5">
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
                        <div className="panel mb-5">
                            <label htmlFor="editor" className="block text-sm font-medium text-gray-700">
                                Product Description
                            </label>
                            <div className="" style={{ height: '250px', overflow: 'scroll' }}>
                                <div ref={editorRef} className="border border-r-8 border-gray-200"></div>
                            </div>

                            {descriptionErrMsg && <p className="error-message mt-1 text-red-500 ">{descriptionErrMsg}</p>}
                        </div>

                        <div className="panel mb-5 ">
                            <div className="flex flex-col  md:flex-row ">
                                {isMounted && (
                                    <Tab.Group>
                                        <div className="mx-10 mb-5 sm:mb-0 ">
                                            <Tab.List className="mb-5 flex w-32 flex-row text-center font-semibold  md:m-auto md:mb-0 md:flex-col ">
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? '!bg-primary text-white !outline-none hover:text-white' : ''}
                                                        relative -mb-[1px] block w-full border-white-light p-3.5 py-2 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:h-[80%] dark:border-[#191e3a] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px]`}
                                                        >
                                                            Variants
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? '!bg-primary text-white !outline-none hover:text-white' : ''}
                                                        relative -mb-[1px] block w-full border-white-light p-3.5 py-2 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:h-[80%] dark:border-[#191e3a] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px]`}
                                                        >
                                                            Attributes
                                                        </button>
                                                    )}
                                                </Tab>

                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${selected ? '!bg-primary text-white !outline-none hover:text-white' : ''}
                                                        relative -mb-[1px] block w-full border-white-light p-3.5 py-2 before:absolute before:bottom-0 before:top-0 before:m-auto before:inline-block before:h-0 before:w-[1px] before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:h-[80%] dark:border-[#191e3a] ltr:border-r ltr:before:-right-[1px] rtl:border-l rtl:before:-left-[1px]`}
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
                                            <Tab.Panel>
                                                {variants?.map((item, index) => (
                                                    <div key={index} className="mb-5 border-b border-gray-200">
                                                        {index !== 0 && ( // Render remove button only for items after the first one
                                                            <div className="active flex items-center justify-end text-danger">
                                                                <button onClick={() => handleRemoveVariants(index)}>
                                                                    <IconTrashLines />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className="active flex items-center">
                                                            <div className="mb-5 mr-4" style={{ width: '20%' }}>
                                                                <label htmlFor={`name${index}`} className="block pr-5 text-sm font-medium text-gray-700">
                                                                    Variant:
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
                                                                    value={item.quantity}
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
                                                ))}
                                                <div className="mb-5">
                                                    <button type="button" className=" btn btn-primary flex justify-end" onClick={handleAddItem}>
                                                        Add item
                                                    </button>
                                                </div>
                                            </Tab.Panel>
                                            <Tab.Panel>
                                                {/* <div className="active flex ">
                                                    <div className="mb-5 pr-3" style={{ width: '50%' }}>
                                                        <Select
                                                            placeholder="Select Type"
                                                            options={optionsVal.filter((option) => !selectedArr.includes(option.value))}
                                                            onChange={(selectedOption: any) => handleDropdownChange(selectedOption, selectedOption.value)}
                                                            // value={options.find((option) => option.value === chooseType)} // Set the value of the selected type
                                                            value={chooseType ? optionsVal.find((option) => option.value === chooseType) : null}
                                                        />
                                                        {attDropDownError && <p className="error-message  text-red-500">{attDropDownError}</p>}
                                                    </div>
                                                    <div className="mb-5">
                                                        <button type="button" className="btn btn-outline-primary" onClick={handleAddAccordion}>
                                                            Add
                                                        </button>
                                                    </div>
                                                </div> */}

                                                <div className="mb-5">
                                                    <div className="space-y-2 font-semibold">
                                                        {attributesData?.map((attr, index) => (
                                                            <div className="rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
                                                                <button
                                                                    type="button"
                                                                    className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] ${active === '1' ? '!text-primary' : ''}`}
                                                                    // onClick={() => togglePara('1')}
                                                                >
                                                                    {capitalizeFLetter(attr?.name)}
                                                                    {/* <button onClick={() => handleRemoveAccordion(item.type)}>Remove</button> */}

                                                                    {/* <div className={`text-red-400 ltr:ml-auto rtl:mr-auto `} onClick={() => handleRemoveAccordion(item.type)}>
                                                                        <IconTrashLines />
                                                                    </div> */}
                                                                </button>
                                                                <div>
                                                                    <AnimateHeight duration={300} height={active === '1' ? 'auto' : 0}>
                                                                        <div className=" gap-4 border-t border-[#d3d3d3] p-4 text-[13px] dark:border-[#1b2e4b]">
                                                                            {/* <div className="col-span-4">
                                                                                <p>
                                                                                    Name:
                                                                                    <br /> <span className="font-semibold">{item.type}</span>
                                                                                </p>
                                                                            </div> */}
                                                                            <div className="w-full">
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
                                                                                        {/* <Select
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
                                                                                        /> */}
                                                                                        {/* <Select
                                                                                            isMulti
                                                                                            options={attr.attribute.choices.edges.map((edge) => ({
                                                                                                value: edge.node.id,
                                                                                                label: edge.node.name,
                                                                                                slug: edge.node.slug,
                                                                                            }))}
                                                                                            value={selectedValues} 
                                                                                            onChange={(selectedOptions) => handleSelectChange(attr.attribute.id, selectedOptions)}
                                                                                            placeholder={`Select ${capitalizeFLetter(attr.attribute.name)}`}
                                                                                        /> */}

                                                                                        {/* <Select
                                                                                            isMulti
                                                                                            options={attr?.attribute?.choices?.edges?.map((edge) => ({
                                                                                                value: edge?.node?.id,
                                                                                                label: edge?.node?.name,
                                                                                                slug: edge?.node?.slug,
                                                                                            }))}
                                                                                            // Set initial value from selectedAttributes state
                                                                                            value={selectedAttributes[attr.attribute.id]?.map((selectedSlug) => {
                                                                                                const option = attr?.attribute?.choices?.edges?.find((edge) => edge?.node?.slug === selectedSlug);
                                                                                                return option ? { value: option?.node.id, label: option?.node?.name } : null;
                                                                                            })}
                                                                                            onChange={(selectedOptions) => handleSelectChange(attr.attribute.id, selectedOptions)}
                                                                                            placeholder={`Select ${capitalizeFLetter(attr.attribute.name)}`}
                                                                                        /> */}

                                                                                        <Select
                                                                                            isMulti
                                                                                            options={attr?.choices?.edges?.map((edge) => ({
                                                                                                value: edge?.node?.id,
                                                                                                label: edge?.node?.name,
                                                                                                slug: edge?.node?.slug, // Include slug
                                                                                            }))}
                                                                                            value={selectedAttributes[attr?.id]?.map((selectedSlug) => {
                                                                                                const option = attr?.choices?.edges?.find((edge) => edge?.node?.slug === selectedSlug);
                                                                                                return option ? { value: option?.node.id, label: option?.node?.name, slug: option?.node?.slug } : null;
                                                                                            })}
                                                                                            onChange={(selectedOptions) => handleSelectChange(attr?.id, selectedOptions)}
                                                                                            placeholder={`Select ${capitalizeFLetter(attr?.name)}`}
                                                                                        />
                                                                                        {/* {attributeError[item.type] && <p className="error-message mt-1 text-red-500">{attributeError[item.type]}</p>} */}

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
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    setMenuOrder(value === '' ? null : value);
                                                                }}
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
                        {/* <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Collections</h5>
                            </div>
                            <div className="mb-5">
                                <Select placeholder="Select an collection" options={collectionList} value={selectedCollection} onChange={selectedCollections} isMulti isSearchable={true} />
                            </div>
                        </div> */}
                        <div className="panel mt-5">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Label</h5>
                            </div>
                            <div className="mb-5">
                                <Select placeholder="Select an label" options={options} value={label} onChange={(val: any) => setLabel(val)} isSearchable={true} />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                        <div className="panel order-4 md:order-1">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Publish</h5>
                            </div>

                            <div className="active flex items-center">
                                <div className="mb-5 w-full pr-3">
                                    <select className="form-select  flex-1 " value={publish} onChange={(e) => setPublish(e.target.value)}>
                                        <option value="published">Published</option>
                                        {/* <option value="pending-reviews">Pending Reviews</option> */}
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <button type="submit" className="btn btn-primary w-full" onClick={() => CreateProduct()}>
                                    {createLoad || deleteLoad || channelLoad || createVariantLoad || createVariantLoad || updateVariantLoad || updateMedaLoad ? <IconLoader /> : 'Create'}
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

                        <div className="panel order-2 mt-5 md:order-2">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Gallery</h5>
                            </div>
                            {/* <div className="grid grid-cols-12 gap-3">
                                {imageUrl?.length > 0 &&
                                    imageUrl?.map((item: any, index: any) => (
                                        <div className="relative col-span-4 flex h-[60px] w-[80px] overflow-hidden " key={index}>
                                            {item?.endsWith('.mp4') ? (
                                                <video controls src={item?.url} className="h-full w-full object-cover">
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <img src={item} alt="Product image" className=" h-full w-full" />
                                            )}
                                            <button onClick={() => handleRemoveImage(index)} className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white">
                                                <IconTrashLines className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                            </div> */}

                            <div className="grid grid-cols-12 gap-3">
                                {imageUrl?.length > 0 &&
                                    imageUrl?.map((item: any, index: any) => (
                                        <>
                                            <div
                                                key={item}
                                                className="h-15 w-15 relative col-span-4 overflow-hidden bg-black"
                                                // draggable
                                                // onDragStart={(e) => handleDragStart(e, item.id, index)}
                                                // onDragOver={handleDragOver}
                                                // onDrop={(e) => handleDrop(e, index)}
                                            >
                                                {item?.endsWith('.mp4') ? (
                                                    <video controls src={item} className="h-full w-full object-cover">
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <img src={item} alt="Product image" className=" h-full w-full" />
                                                )}

                                                <button className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white" onClick={() => handleRemoveImage(index)}>
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
                                    setSelectedImg(null);
                                }}
                            >
                                Add product gallery images
                            </p>
                        </div>

                        <div className="panel order-4  mt-5 md:order-3">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Categories</h5>
                            </div>
                            <div className="mb-5">
                                <CategorySelect
                                    queryFunc={fetchCategories} // Pass the function to fetch categories
                                    selectedCategory={selectedCat} // Use 'selectedCategory' instead of 'value'
                                    onCategoryChange={(data) => setselectedCat(data)} // Use 'onCategoryChange' instead of 'onChange'
                                    placeholder="Select categories"
                                />
                                {/* <Select isMulti value={selectedCat} onChange={(e) => setselectedCat(e)} options={parentLists} placeholder="Select categories..." className="form-select" /> */}

                                {categoryErrMsg && <p className="error-message mt-1 text-red-500 ">{categoryErrMsg}</p>}
                            </div>
                            <p className="mt-5 cursor-pointer text-primary underline" onClick={() => setIsOpenCat(true)}>
                                Add a new category
                            </p>
                        </div>

                        <div className="panel order-1  mt-5 md:order-4">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Tags</h5>
                            </div>
                            <div className="mb-5">
                                <TagSelect loading={tagloading} queryFunc={fetchTag} selectedCategory={selectedTag} onCategoryChange={(data) => setSelectedTag(data)} />

                                {/* <Select placeholder="Select an tags" options={tagList} value={selectedTag} onChange={(data: any) => setSelectedTag(data)} /> */}
                            </div>
                            <p className="mt-5 cursor-pointer text-primary underline" onClick={() => setIsOpenTag(true)}>
                                Add a new tag
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Transition appear show={modal2} as={Fragment}>
                <Dialog
                    as="div"
                    open={modal2}
                    onClose={() => {
                        setSelectedImg(null);
                        setSelectedImages([]);
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
                                                setSelectedImg(null);
                                                setSelectedImages([]);
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
                                                        setMediaType('all');
                                                        setMediaMonth('all'), setMediaSearch('');
                                                        setSelectedImages([]);
                                                    }}
                                                    className={`${mediaTab == 0 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 before:inline-block `}
                                                >
                                                    Upload Files
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setMediaTab(1);
                                                        setMediaType('all');
                                                        setMediaMonth('all'), setMediaSearch('');
                                                    }}
                                                    className={`${mediaTab == 1 ? 'bg-primary text-white !outline-none' : ''}
                                                    -mb-[1px] flex items-center rounded p-3.5 py-2 before:inline-block `}
                                                >
                                                    Media Library
                                                </button>
                                            </div>

                                            <button
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    const urls = selectedImages?.map((item) => item?.node?.fileUrl);
                                                    // const updatedUrls = urls.map((url) => url?.replace('.cdn', ''));
                                                    setImageUrl([...urls, ...imageUrl]);
                                                    setModal2(false);
                                                    setSelectedImages([]);
                                                    setSelectedImg(null);
                                                }}
                                            >
                                                Set Product Image
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
                                                                        <select className="form-select w-60 flex-1" value={mediaType} onChange={(e) => filterMediaByType(e.target.value)}>
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
                                                                        {/* <select className="form-select w-40 flex-1"> */}
                                                                        <select className="form-select w-60 flex-1" value={mediaMonth} onChange={(e) => filterMediaByMonth(e.target.value)}>
                                                                            <option value="all">All Data</option>
                                                                            {months.map((month, index) => (
                                                                                <option key={month} value={`${month}/2024`}>{`${month} 2024`}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <input
                                                                            type="text"
                                                                            className="form-input mr-2  w-80 "
                                                                            placeholder="Search..."
                                                                            value={mediaSearch}
                                                                            onChange={(e) => searchMediaByName(e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className=" ">
                                                            {loading ? (
                                                                <CommonLoader />
                                                            ) : (
                                                                <div className="grid grid-cols-6 pt-5 ">
                                                                    {imageList?.length > 0 ? (
                                                                        imageList?.map((item) => {
                                                                            return (
                                                                                <div
                                                                                    key={item.node?.fileUrl}
                                                                                    className={`flex h-[150px] w-[150px] overflow-hidden p-2 ${
                                                                                        selectedImages.includes(item) ? 'border-4 border-blue-500' : ''
                                                                                    }`}
                                                                                    onMouseDown={() => handleMouseDown(item)}
                                                                                    onMouseUp={handleMouseUp}
                                                                                    onMouseLeave={handleMouseLeave}
                                                                                    onClick={() => {
                                                                                        handleClickImage(item);
                                                                                        // deletesImg(item)
                                                                                    }}
                                                                                >
                                                                                    {item.node?.fileUrl?.endsWith('.mp4') ? (
                                                                                        <video controls src={item.node?.fileUrl} className="h-full w-full object-cover">
                                                                                            Your browser does not support the video tag.
                                                                                        </video>
                                                                                    ) : item.node?.fileUrl?.endsWith('.pdf') ? (
                                                                                        <Image src={pdf} alt="Loading..." />
                                                                                    ) : item.node?.fileUrl?.endsWith('.doc') ? (
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
                                                                <div>
                                                                    {selectedImg?.endsWith('.mp4') ? (
                                                                        <video controls src={selectedImg} className="h-full w-full object-cover">
                                                                            Your browser does not support the video tag.
                                                                        </video>
                                                                    ) : selectedImg?.endsWith('.pdf') ? (
                                                                        <Image src={pdf} alt="Loading..." />
                                                                    ) : selectedImg?.endsWith('.doc') ? (
                                                                        <Image src={docs} alt="Loading..." />
                                                                    ) : (
                                                                        <img src={selectedImg} alt="" className="h-full w-full" />
                                                                    )}
                                                                </div>
                                                                {/* <p className="mt-2 font-semibold">{selectedImg}</p> */}
                                                                <p className="mt-2 font-semibold">{getKey(selectedImg)}</p>

                                                                <p className="text-sm">{moment(mediaData?.lastModified).format('DD-MM-YYYY')}</p>
                                                                <p className="text-sm">{mediaData?.size}</p>

                                                                <a href="#" className="text-danger underline" onClick={() => multiImageDelete()}>
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
                                                                        value={description}
                                                                        onChange={(e) => setDescription(e.target.value)}
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

            {/* product multiple img popup */}
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
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Modal
                addHeader={'Create Category'}
                open={isOpenCat}
                close={() => setIsOpenCat(false)}
                renderComponent={() => (
                    <div>
                        <div className="mb-5 p-5">
                            <form>
                                <div>
                                    <label htmlFor="name">Name </label>
                                    <input name="name" type="text" id="name" placeholder="Enter Name" className="form-input" value={formData.name} onChange={handleCatChange} />
                                </div>

                                <div>
                                    <label htmlFor="description">Description </label>
                                    <textarea name="description" id="description" placeholder="Enter Description" className="form-input" value={formData.description} onChange={handleCatChange} />
                                </div>

                                <div>
                                    <label htmlFor="parentCategory">Parent Category</label>
                                    <select name="parentCategory" className="form-select" value={formData.parentCategory} onChange={handleCatChange}>
                                        <option value="">Open this select</option>
                                        {newCatParentLists?.map((item) => (
                                            <React.Fragment key={item?.node?.id}>
                                                <option value={item?.node?.id}>{item.node?.name}</option>
                                                {item?.node?.children?.edges?.map((child) => (
                                                    <option key={child?.node?.id} value={child?.node?.id} style={{ paddingLeft: '20px' }}>
                                                        -- {child?.node?.name}
                                                    </option>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </select>
                                </div>

                                <button type="button" onClick={() => createNewCategory()} className="btn btn-primary !mt-6">
                                    {createCategoryLoader ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            />

            <Transition appear show={isOpenTag} as={Fragment}>
                <Dialog as="div" open={isOpenTag} onClose={() => setIsOpenTag(false)}>
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
                                        <div className="text-lg font-bold">{'Create Tags'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setIsOpenTag(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5">
                                        <Formik
                                            initialValues={{ name: '' }}
                                            validationSchema={SubmittedForm}
                                            onSubmit={(values, { resetForm }) => {
                                                createTags(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                                            }}
                                        >
                                            {({ errors, submitCount, touched, setFieldValue, values }: any) => (
                                                <Form className="space-y-5">
                                                    {/* <div className={submitCount ? (errors.image ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="image">Image</label>
                                                        <input
                                                            id="image"
                                                            name="image"
                                                            type="file"
                                                            onChange={(event: any) => {
                                                                setFieldValue('image', event.currentTarget.files[0]);
                                                            }}
                                                            className="form-input"
                                                        />
                                                        {values.image && typeof values.image === 'string' && (
                                                            <img src={values.image} alt="Product Image" style={{ width: '30px', height: 'auto', paddingTop: '5px' }} />
                                                        )}
                                                        {submitCount ? errors.image ? <div className="mt-1 text-danger">{errors.image}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    <div className={submitCount ? (errors.name ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="fullName">Name </label>
                                                        <Field name="name" type="text" id="fullName" placeholder="Enter Name" className="form-input" />

                                                        {submitCount ? errors.name ? <div className="mt-1 text-danger">{errors.name}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>
                                                    {/* <div className="mb-5">
                                                        <label htmlFor="description">Description</label>

                                                        <textarea
                                                            id="description"
                                                            rows={3}
                                                            placeholder="Enter description"
                                                            name="description"
                                                            className="form-textarea min-h-[130px] resize-none"
                                                        ></textarea>
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.description ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="description">description </label>
                                                        <Field name="description" as="textarea" id="description" placeholder="Enter Description" className="form-input" />

                                                        {submitCount ? (
                                                            errors.description ? (
                                                                <div className="mt-1 text-danger">{errors.description}</div>
                                                            ) : (
                                                                <div className="mt-1 text-success"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.slug ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="slug">Slug </label>
                                                        <Field name="slug" type="text" id="slug" placeholder="Enter Description" className="form-input" />

                                                        {submitCount ? errors.slug ? <div className="mt-1 text-danger">{errors.slug}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.count ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="count">Count</label>
                                                        <Field name="count" type="number" id="count" placeholder="Enter Count" className="form-input" />

                                                        {submitCount ? errors.count ? <div className="mt-1 text-danger">{errors.count}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div> */}

                                                    {/* <div className={submitCount ? (errors.parentCategory ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="parentCategory">Parent Category</label>
                                                        <Field as="select" name="parentCategory" className="form-select">
                                                            <option value="">Open this select menu</option>
                                                            <option value="Anklets">Anklets</option>
                                                            <option value="BlackThread">__Black Thread</option>
                                                            <option value="Kada">__Kada</option>
                                                        </Field>
                                                        {submitCount ? (
                                                            errors.parentCategory ? (
                                                                <div className=" mt-1 text-danger">{errors.parentCategory}</div>
                                                            ) : (
                                                                <div className=" mt-1 text-[#1abc9c]"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div> */}

                                                    <button type="submit" className="btn btn-primary !mt-6">
                                                        {'Submit'}
                                                    </button>
                                                </Form>
                                            )}
                                        </Formik>
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
                                <Dialog.Panel as="div" className="panel my-8 w-[70%] overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">Preview</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setIsOpenPreview(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="flex h-full w-full justify-center gap-3">
                                        <div className="panel flex  h-[600px] w-2/12 flex-col items-center overflow-scroll">
                                            {productPreview?.image?.length > 0 ? (
                                                <div className="overflow-auto">
                                                    {productPreview?.image?.map((item, index) => (
                                                        <div key={index} className="h-100 w-[200px] cursor-pointer overflow-hidden p-2" onClick={() => setPreviewSelectedImg(item)}>
                                                            <img src={item} alt="image" className="object-contain" />
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
                                                <img src={previewSelectedImg ? previewSelectedImg : productPreview?.image[0]} alt="image" style={{ width: '100%', height: '100%' }} />
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
                                                        (item, index) =>
                                                            item?.regularPrice !== 0 && (
                                                                <label key={index} htmlFor="name" className="block text-2xl font-medium text-gray-700">
                                                                    ₹{addCommasToNumber(item?.regularPrice)}
                                                                </label>
                                                            )
                                                    )}
                                                </div>
                                            )}
                                            {productPreview?.shortDescription && (
                                                <label htmlFor="name" className="text-md block font-medium text-gray-700">
                                                    {productPreview?.shortDescription}
                                                </label>
                                            )}
                                            <div className="panel w-full ">
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
                                                {productPreview?.attributes?.length > 0 && (
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
                                                                // gap: 5,
                                                            }}
                                                        >
                                                            {productPreview?.attributes?.map((key: any) => (
                                                                <div className="flex flex-wrap gap-3" key={key?.id}>
                                                                    <span style={{ fontWeight: 'bold' }}>{key?.name} : </span>
                                                                    {key?.values?.map((item, index) => (
                                                                        <span key={item} style={{ marginRight: '1px', cursor: 'pointer' }}>
                                                                            {item}
                                                                            {index < key?.values?.length - 1 ? ',' : ''}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ))}
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
                                                    <div className="flex flex-wrap  gap-2 pt-2">
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
                                                    <div className="flex flex-wrap  gap-2 pt-2">
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

export default PrivateRouter(ProductAdd);
