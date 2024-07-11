import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState, Fragment, useCallback, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconBell from '@/components/Icon/IconBell';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconPencil from '@/components/Icon/IconPencil';
import { Button } from '@mantine/core';
import Dropdown from '../../../components/Dropdown';
import IconCaretDown from '@/components/Icon/IconCaretDown';

import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import Image1 from '@/public/assets/images/profile-1.jpeg';
import Image2 from '@/public/assets/images/profile-2.jpeg';
import Image3 from '@/public/assets/images/profile-3.jpeg';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import IconEye from '@/components/Icon/IconEye';
import { date } from 'yup/lib/locale';
import Link from 'next/link';
import { useRouter } from 'next/router';
import IconEdit from '@/components/Icon/IconEdit';
import Select from 'react-select';
// import dynamic from 'next/dynamic';
// import 'react-quill/dist/quill.snow.css';
// const ReactQuill = dynamic(import('react-quill'), { ssr: false });

import { Tab } from '@headlessui/react';
import AnimateHeight from 'react-animate-height';
import { useMutation, useQuery } from '@apollo/client';
import {
    ASSIGN_TAG_PRODUCT,
    CATEGORY_LIST,
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
    PRODUCT_CAT_LIST,
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
} from '@/query/product';
import { Failure, Success, deleteImagesFromS3, fetchImagesFromS3, formatOptions, generatePresignedPost, objIsEmpty, sampleParams, showDeleteAlert, uploadImage } from '@/utils/functions';
import IconRestore from '@/components/Icon/IconRestore';
import { cA } from '@fullcalendar/core/internal-common';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import Modal from '@/components/Modal';
import IconLoader from '@/components/Icon/IconLoader';
import moment from 'moment';
import axios from 'axios';
const ProductAdd = () => {
    const router = useRouter();
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Add New Product'));
    });

    const [modal1, setModal1] = useState(false);
    const [modal2, setModal2] = useState(false);
    const [copied, setCopied] = useState(false);

    const [mediaTab, setMediaTab] = useState(0);

    const [isMounted, setIsMounted] = useState(false); //tabs

    useEffect(() => {
        setIsMounted(true);
    });
    const [menuOrder, setMenuOrder] = useState(0);

    // ------------------------------------------New Data--------------------------------------------

    const [productName, setProductName] = useState('');
    const [slug, setSlug] = useState('');
    const [seoTittle, setSeoTittle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');

    const [shortDescription, setShortDescription] = useState('');

    const [selectedCollection, setSelectedCollection] = useState([]);
    const [tagList, setTagList] = useState([]);
    const [selectedTag, setSelectedTag] = useState([]);
    const [publish, setPublish] = useState('published');
    const [modal4, setModal4] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentCategory: '',
    });

    //for accordiant
    const [selectedArr, setSelectedArr] = useState<any>([]);
    const [accordions, setAccordions] = useState<any>([]);
    const [openAccordion, setOpenAccordion] = useState('');
    const [chooseType, setChooseType] = useState('');
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
    // error message end

    const [dropdowndata, setDropdownData] = useState<any>('');
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
    const [parentLists, setParentLists] = useState([]);
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

    // -------------------------------------New Added-------------------------------------------------------

    const { error, data: orderDetails } = useQuery(CHANNEL_LIST, {
        variables: sampleParams,
    });
    const { data: finishData } = useQuery(FINISH_LIST, {
        variables: sampleParams,
    });

    const { data: stoneData } = useQuery(STONE_LIST, {
        variables: sampleParams,
    });
    const { data: designData } = useQuery(DESIGN_LIST, {
        variables: sampleParams,
    });

    const { data: styleData } = useQuery(STYLE_LIST, {
        variables: sampleParams,
    });
    // -----------------New --------------------------------
    const { data: stoneColorData } = useQuery(COLOR_LIST, {
        variables: sampleParams,
    });

    const { data: typeData } = useQuery(TYPE_LIST, {
        variables: sampleParams,
    });

    const { data: sizeData } = useQuery(SIZE_LIST, {
        variables: sampleParams,
    });

    const [addCategory] = useMutation(CREATE_CATEGORY);
    const [addTag] = useMutation(CREATE_TAG);

    const { data: parentList, error: parentListError } = useQuery(PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    const { data: productSearch, refetch: productSearchRefetch } = useQuery(PRODUCT_BY_NAME);

    useEffect(() => {
        const arr1 = {
            design: designData?.productDesigns,
            style: styleData?.productStyles,
            finish: finishData?.productFinishes,
            stoneType: stoneData?.productStoneTypes,
            stoneColor: stoneColorData?.stoneColors,
            type: typeData?.itemTypes,
            size: sizeData?.sizes,
        };

        const singleObj = Object.entries(arr1).reduce((acc: any, [key, value]) => {
            acc[key] = value?.edges.map(({ node }: any) => ({ value: node?.id, label: node?.name }));
            return acc;
        }, {});

        setDropdownData(singleObj);
    }, [finishData, stoneData, designData, styleData, stoneColorData, typeData, sizeData]);

    useEffect(() => {
        const getparentCategoryList = parentList?.categories?.edges;
        const options = formatOptions(getparentCategoryList);
        setParentLists(options);
    }, [parentList]);

    useEffect(() => {
        getProductForUpsells();
    }, [searchUpsells]);

    useEffect(() => {
        getProductForCrossell();
    }, [searchCrossell]);

    const { data: tagsList, refetch: tagListRefetch } = useQuery(PRODUCT_LIST_TAGS, {
        variables: { channel: 'india-channel' },
    });

    const { data: cat_list, refetch: categoryListRefetch } = useQuery(PRODUCT_CAT_LIST, {
        variables: sampleParams,
    });

    const { data: collection_list } = useQuery(COLLECTION_LIST, {
        variables: sampleParams,
    });

    const { data: productTypelist } = useQuery(PRODUCT_TYPE_LIST, {
        variables: sampleParams,
    });

    const [addFormData] = useMutation(CREATE_PRODUCT);
    const [deleteProducts] = useMutation(DELETE_PRODUCTS);
    const [updateProductChannelList] = useMutation(UPDATE_PRODUCT_CHANNEL);
    const [createVariant] = useMutation(CREATE_VARIANT);
    const [updateVariantList] = useMutation(UPDATE_VARIANT_LIST);
    const [updateMedatData] = useMutation(UPDATE_META_DATA);
    const [assignTagToProduct] = useMutation(ASSIGN_TAG_PRODUCT);
    const [createMedia] = useMutation(PRODUCT_MEDIA_CREATE_NEW);

    const [categoryList, setCategoryList] = useState([]);
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
    const [selectedImg, setSelectedImg] = useState({});
    const [selectedImages, setSelectedImages] = useState([]);
    const longPressTimeout = useRef(null);

    const [createCategoryLoader, setCreateCategoryLoader] = useState(false);

    useEffect(() => {
        category_list();
    }, [cat_list]);

    useEffect(() => {
        tags_list();
    }, [tagsList]);

    useEffect(() => {
        collections_list();
    }, [collection_list]);

    useEffect(() => {
        productsType();
    }, [productTypelist]);

    useEffect(() => {
        getMediaImage();
    }, []);

    const getMediaImage = async () => {
        try {
            const res = await fetchImagesFromS3();
            console.log('res: ', res);
            setMediaImages(res);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const category_list = async () => {
        try {
            if (cat_list) {
                if (cat_list && cat_list?.search?.edges?.length > 0) {
                    const list = cat_list?.search?.edges;
                    const dropdownData = list?.map((item: any) => {
                        return { value: item.node?.id, label: item.node?.name };
                    });

                    setCategoryList(dropdownData);
                }
            }
        } catch (error) {}
    };

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

        console.log('value: ', value);
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

    const CreateProduct = async () => {
        try {
            const savedContent = await editorInstance.save();
            const descr = JSON.stringify(savedContent, null, 2);
            setCreateLoading(true);
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
            const errors = {
                productName: productName.trim() === '' ? 'Product name cannot be empty' : '',
                slug: slug.trim() === '' ? 'Slug cannot be empty' : '',
                seoTittle: seoTittle.trim() === '' ? 'Seo title cannot be empty' : '',
                seoDesc: seoDesc.trim() === '' ? 'Seo description cannot be empty' : '',
                description: savedContent?.blocks?.length == 0 ? 'Description cannot be empty' : '',
                shortDescription: shortDescription?.trim() === '' ? 'Short description cannot be empty' : '',
                category: selectedCat?.length == 0 ? 'Category cannot be empty' : '',
            };

            setProductNameErrMsg(errors.productName);
            setSlugErrMsg(errors.slug);
            setSeoTittleErrMsg(errors.seoTittle);
            setSeoDescErrMsg(errors.seoDesc);
            setDescriptionErrMsg(errors.description);
            setShortDesErrMsg(errors.shortDescription);
            setCategoryErrMsg(errors.category);

            if (Object.values(errors).some((msg) => msg !== '')) {
                setCreateLoading(false);

                return; // Exit if any required fields are empty
            }

            const attributeErrors: any = {};
            if (!selectedValues || Object.keys(selectedValues).length === 0) {
                setCreateLoading(false);

                setAttributeError('Attributes cannot be empty');
            } else {
                if (selectedValues?.stone?.length === 0) attributeErrors.stone = 'Stone cannot be empty';
                if (selectedValues?.design?.length === 0) attributeErrors.design = 'Design cannot be empty';
                if (selectedValues?.style?.length === 0) attributeErrors.style = 'Style cannot be empty';
                if (selectedValues?.finish?.length === 0) attributeErrors.finish = 'Finish cannot be empty';

                if (selectedValues?.type?.length === 0) attributeErrors.type = 'Type cannot be empty';
                if (selectedValues?.size?.length === 0) attributeErrors.size = 'Size cannot be empty';
                if (selectedValues?.stoneColor?.length === 0) attributeErrors.stoneColor = 'Stone color cannot be empty';

                setCreateLoading(false);

                setAttributeError(attributeErrors);
            }

            const variantErrors = variants?.map((variant) => {
                const errors: any = {};
                if (!variant.sku) errors.sku = 'SKU cannot be empty';
                if (variant.quantity <= 0 || isNaN(variant.quantity)) errors.quantity = 'Quantity must be a valid number and greater than 0';
                if (variant.regularPrice <= 0 || isNaN(variant.regularPrice)) errors.regularPrice = 'Regular Price must be a valid number and greater than 0';
                if (!variant.stackMgmt) errors.stackMgmt = 'Check Stack Management';
                setCreateLoading(false);

                return errors;
            });

            setVariantErrors(variantErrors);
            if (variantErrors.some((err) => Object.keys(err).length > 0)) {
                setCreateLoading(false);

                return; // Exit if any variant has errors
            }

            // const catId = selectedCat?.value;
            const collectionId = selectedCollection?.map((item) => item.value) || [];
            const tagId = selectedTag?.map((item) => item.value) || [];

            let upsells = [];
            if (selectedUpsell?.length > 0) {
                upsells = selectedUpsell?.map((item) => item?.value);
            }
            let crosssells = [];
            if (selectedCrosssell?.length > 0) {
                crosssells = selectedCrosssell?.map((item) => item?.value);
            }

            const { data } = await addFormData({
                variables: {
                    input: {
                        description: descr,
                        attributes: [],
                        category: selectedCat?.map((item) => item?.value),
                        collections: collectionId,
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
                        ...(menuOrder && menuOrder > 0 && { order_no: menuOrder }),
                        ...(selectedValues && selectedValues.design && { prouctDesign: selectedValues.design }),
                        ...(selectedValues && selectedValues.style && { productstyle: selectedValues.style }),
                        ...(selectedValues && selectedValues.finish && { productFinish: selectedValues.finish }),
                        ...(selectedValues && selectedValues.stone && { productStoneType: selectedValues.stone }),
                        ...(selectedValues && selectedValues.type && { productItemtype: selectedValues.type }),
                        ...(selectedValues && selectedValues.size && { productSize: selectedValues.size }),
                        ...(selectedValues && selectedValues.stoneColor && { productStonecolor: selectedValues.stoneColor }),
                    },
                },
            });

            if (data?.productCreate?.errors?.length > 0) {
                setCreateLoading(false);

                Failure(data?.productCreate?.errors[0]?.message);
                console.log('Error: ', data?.productCreate?.errors[0]?.message);
            } else {
                const productId = data?.productCreate?.product?.id;
                productChannelListUpdate(productId);
                if (imageUrl?.length > 0) {
                    imageUrl.forEach(async (item) => {
                        createMediaData(productId, item);
                        console.log('imageUrl: ', imageUrl);

                        // const imageUpload = await uploadImage(productId, item);
                        // console.log('Image upload: ', imageUpload);
                    });
                }
            }
        } catch (error) {
            console.log('Error: ', error);
        }
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
                console.log('error: ', data?.productChannelListingUpdate?.errors[0]?.message);
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
                        quantity: item.stackMgmt ? item.quantity : 0,
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
                console.log('resVariants: ', resVariants);
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
            // input.push({
            //     key: 'description',
            //     value: description,
            // });
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
                console.log('error: ', data?.updateMetadata?.errors[0]?.message);
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
            console.log('createMediaData: ', data);
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

    // const assignsTagToProduct = async (productId: any) => {
    //     try {
    //         let tagId: any[] = [];
    //         // if (selectedCollection?.length > 0) {
    //         tagId = selectedTag?.map((item:any) => item.value);
    //         // }
    //         console.log('tagId: ', tagId);

    //         const { data } = await assignTagToProduct({
    //             variables: {
    //                 id: productId,
    //                 input: {
    //                     tags: tagId,
    //                 },
    //             },
    //             // variables: { email: formData.email, password: formData.password },
    //         });
    //         if (data?.productUpdate?.errors?.length > 0) {
    //             console.log('error: ', data?.updateMetadata?.errors[0]?.message);
    //         } else {
    //             router.push(`/apps/product/edit?id=${productId}`)
    //             console.log('success: ', data);
    //         }
    //     } catch (error) {
    //         console.log('error: ', error);
    //     }
    // };

    // form submit
    const createNewCategory = async () => {
        console.log('createNewCategory: ');
        setCreateCategoryLoader(true);
        try {
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
            console.log('data: ', data);
            categoryListRefetch();
            setIsOpenCat(false);
            setCreateCategoryLoader(false);
            Success('Category created successfully');
            setselectedCat({ label: data?.categoryCreate?.category?.name, value: data?.categoryCreate?.category?.id });
            setFormData({
                name: '',
                description: '',
                parentCategory: '',
            });
        } catch (error) {
            console.log('error: ', error);
            setCreateCategoryLoader(false);
        }
    };

    const handleAddAccordion = () => {
        const selectedType = arr.find((item) => item?.type === chooseType);
        setSelectedArr([chooseType, ...selectedArr]);
        setAccordions([selectedType, ...accordions]);
        setOpenAccordion(chooseType);
        setSelectedValues({ ...selectedValues, [chooseType]: [] }); // Clear selected values for the chosen type
    };

    const handleRemoveAccordion = (type: any) => {
        setSelectedArr(selectedArr.filter((item: any) => item !== type));
        setAccordions(accordions.filter((item: any) => item.type !== type));
        setOpenAccordion('');
        const updatedSelectedValues: any = { ...selectedValues };
        delete updatedSelectedValues[type];
        setSelectedValues(updatedSelectedValues);
    };

    const handleDropdownChange = (event: any, type: any) => {
        setChooseType(type);
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

    const deleteImage = async () => {
        try {
            const res = await deleteImagesFromS3(selectedImg?.key);
            getMediaImage();
            setSelectedImg({});
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleFileChange = async (e) => {
        try {
            const presignedPostData = await generatePresignedPost(e.target.files[0]);
            console.log('Presigned POST data: ', presignedPostData);

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
            console.log('response: ', response);

            getMediaImage();
            setMediaTab(1);
            console.log('File uploaded successfully', response);
        } catch (error) {
            console.error('Error uploading file:', error);
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
                        <div className="panel mb-5">
                            <label htmlFor="editor" className="block text-sm font-medium text-gray-700">
                                Product description
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
                                                <div className="active flex items-center">
                                                    <div className="mb-5 pr-3" style={{ width: '50%' }}>
                                                        <Select
                                                            placeholder="Select Type"
                                                            options={optionsVal.filter((option) => !selectedArr.includes(option.value))}
                                                            onChange={(selectedOption: any) => handleDropdownChange(selectedOption, selectedOption.value)}
                                                            value={options.find((option) => option.value === chooseType)} // Set the value of the selected type
                                                        />
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
                                                                >
                                                                    {item?.type}

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
                                                                                    <br /> <span className="font-semibold">{item?.type}</span>
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
                                                                                        <Select
                                                                                            placeholder={`Select ${item?.type} Name`}
                                                                                            options={item?.[`${item?.type}Name`]}
                                                                                            onChange={(selectedOptions) => handleMultiSelectChange(selectedOptions, item.type)}
                                                                                            isMulti
                                                                                            isSearchable={true}
                                                                                            value={(selectedValues[item.type] || []).map((value: any) => {
                                                                                                const option = item[`${item.type}Name`].find((option: any) => option.value === value);
                                                                                                return { value: option.value, label: option.label };
                                                                                            })}
                                                                                        />
                                                                                        {attributeError[item.type] && <p className="error-message mt-1 text-red-500">{attributeError[item.type]}</p>}
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
                                                        {item.stackMgmt && (
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
                                                        )}
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

                            <button type="submit" className="btn btn-primary w-full" onClick={() => CreateProduct()}>
                                {createLoading ? <IconLoader /> : 'Create'}
                            </button>
                        </div>

                        <div className="panel order-2 mt-5 md:order-2">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Gallery</h5>
                            </div>
                            <div className="grid grid-cols-12 gap-3">
                                {imageUrl?.length > 0 &&
                                    imageUrl?.map((item: any, index: any) => (
                                        <div className="relative col-span-4 flex h-[60px] w-[80px] overflow-hidden " key={index}>
                                            {item?.endsWith('.mp4') ? (
                                                <video controls src={item} className="h-full w-full object-cover">
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

                                {/* <div className="col-span-4">
                                            <img src="https://via.placeholder.com/100x100" alt="Product image" className=" object-cover" />
                                        </div> */}
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
                            {/* <button type="button" className="btn btn-primary mt-5" onClick={() => productVideoPopup()}>
                                + Video
                            </button> */}
                        </div>

                        <div className="panel order-4  mt-5 md:order-3">
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Categories</h5>
                            </div>
                            <div className="mb-5">
                                {/* <select className="form-select flex-1" onChange={(e) => CategoryChange(e.target.value)}>
                                <option value="">Select a Categories </option>
                                {categoryList?.map((item: any) => {
                                    return (
                                        <>
                                            <option value={item?.node?.id}>{item.node?.name}</option>
                                            {item?.node?.children?.edges.map((child: any) => (
                                                <option key={child.id} value={child.node?.id} style={{ paddingLeft: '20px' }}>
                                                    -- {child.node?.name}
                                                </option>
                                            ))}
                                        </>
                                    );
                                })}
                            </select> */}
                                <Select isMulti value={selectedCat} onChange={(e) => setselectedCat(e)} options={parentLists} placeholder="Select categories..." className="form-select" />
                                {/* <select name="parentCategory" className="form-select" value={selectedCat} onChange={(e) => selectCat(e.target.value)}>
                                    <option value="">Open this select</option>
                                    {parentLists?.map((item) => (
                                        <React.Fragment key={item?.node?.id}>
                                            <option value={item?.node?.id}>{item.node?.name}</option>
                                            {item?.node?.children?.edges?.map((child) => (
                                                <option key={child?.node?.id} value={child?.node?.id} style={{ paddingLeft: '20px' }}>
                                                    -- {child?.node?.name}
                                                </option>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </select> */}

                                {/* <Select placeholder="Select an category" options={categoryList} value={selectedCat} onChange={selectCat} isSearchable={true} /> */}
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
                                <Select placeholder="Select an tags" options={tagList} value={selectedTag} onChange={(data: any) => setSelectedTag(data)} isSearchable={true} isMulti />
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
                                                                {/* <select className="form-select flex-1">
                                                                            <option value=""> </option>
                                                                            <option value="Anklets">Anklets</option>
                                                                            <option value="Earings">Earings</option>
                                                                            <option value="Palakka">Palakka</option>
                                                                        </select>{' '} */}
                                                                <select className="form-select w-40 flex-1">
                                                                    <option value="">All Datas </option>
                                                                    <option value="June2023">June2023</option>
                                                                    <option value="july2023">july2023</option>
                                                                    <option value="aug2023">aug2023</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    className="form-input mr-2 w-auto"
                                                                    placeholder="Search..."
                                                                    // value={search}
                                                                    // onChange={(e) => setSearch(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-6 gap-3 pt-5">
                                                            {mediaImages?.map((item) => (
                                                                <div
                                                                    key={item.url}
                                                                    className={`flex h-[160px] w-[180px] overflow-hidden p-2 ${selectedImages.includes(item) ? 'border-4 border-blue-500' : ''}`}
                                                                    // className={`flex h-[200px] w-[200px] overflow-hidden p-2   ${selectedImages.includes(item) ? 'border-4 border-blue-500' : ''}`}
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
                                                                    ) : (
                                                                        <img src={item.url} alt="" className="h-full w-full" />
                                                                    )}
                                                                    {/* <img src={item.url} alt="" className="h-full w-full object-cover" /> */}
                                                                </div>
                                                            ))}
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
                                                                <div>
                                                                    {selectedImg?.key?.endsWith('.mp4') ? (
                                                                        <video controls src={selectedImg.url} className="h-full w-full object-cover">
                                                                            Your browser does not support the video tag.
                                                                        </video>
                                                                    ) : (
                                                                        <img src={selectedImg?.url} alt="" />
                                                                    )}
                                                                </div>
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
                                                        className="btn btn-primary"
                                                        onClick={() => {
                                                            const urls = selectedImages?.map((item) => item.url);
                                                            setImageUrl([...urls, ...imageUrl]);
                                                            setModal2(false);
                                                            setSelectedImages([]);
                                                            setSelectedImg({});
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
                                        {parentLists?.map((item) => (
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
        </div>
    );
};

export default PrivateRouter(ProductAdd);
