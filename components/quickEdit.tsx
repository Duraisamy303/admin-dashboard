import { Failure, useSetState } from '@/utils/functions';
import React, { useEffect } from 'react';
import IconTrashLines from './Icon/IconTrashLines';
import {
    CREATE_VARIANT,
    DELETE_VARIENT,
    NEW_PARENT_CATEGORY_LIST,
    PARENT_CATEGORY_LIST,
    PRODUCT_FULL_DETAILS,
    PRODUCT_LIST_TAGS,
    UPDATE_PRODUCT,
    UPDATE_PRODUCT_CHANNEL,
    UPDATE_VARIANT,
    UPDATE_VARIANT_LIST,
} from '@/query/product';
import { useMutation, useQuery } from '@apollo/client';
import Select from 'react-select';
import IconLoader from './Icon/IconLoader';
import TagSelect from './TagSelect';
import CategorySelect from './CategorySelect';

export default function QuickEdit(props: any) {
    const { data, updateList, closeExpand } = props;

    const [deleteVarient] = useMutation(DELETE_VARIENT);

    const { data: productDetails, refetch: productDetailsRefetch } = useQuery(PRODUCT_FULL_DETAILS);
    const { refetch: catListRefetch } = useQuery(PARENT_CATEGORY_LIST);
    const [updateProductChannelList] = useMutation(UPDATE_PRODUCT_CHANNEL);
    const [updateVariantList] = useMutation(UPDATE_VARIANT_LIST);
    const [updateVariant] = useMutation(UPDATE_VARIANT);
    const [createVariant] = useMutation(CREATE_VARIANT);

    const { refetch: tagsListRefetch } = useQuery(PRODUCT_LIST_TAGS);
    const [updateProduct] = useMutation(UPDATE_PRODUCT);

    const { refetch: categorySearchRefetch } = useQuery(NEW_PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    const { refetch: tagRefetch, loading: tagloading } = useQuery(PRODUCT_LIST_TAGS);

    const fetchCategories = async (variables) => {
        return await categorySearchRefetch(variables);
    };

    const fetchTag = async (variables) => {
        return await tagRefetch(variables);
    };

    const [state, setState] = useSetState({
        name: '',
        slug: '',
        seoTittle: '',
        seoDesc: '',
        variants: [
            {
                sku: '',
                stackMgmt: false,
                quantity: 0,
                regularPrice: 0,
                salePrice: 0,
                name: '',
                id: '',
            },
        ],
        tagsOption: [],
        tags: [],
        categoriesOption: [],
        categories: [],
        publish: 'published',
        productData: null,
        menuOrder: null,
        loading: false,
        error: {},
        variantError: [],
    });

    useEffect(() => {
        getProductDetails();
        tags_list();
        cat_list();
    }, [data]);

    const getProductDetails = async () => {
        try {
            const res = await productDetailsRefetch({
                channel: 'india-channel',
                id: data.id,
            });
            const response = res?.data?.product;

            setState({ name: response?.name, productData: response });
            if (response?.variants?.length > 0) {
                const variants = response?.variants?.map((item: any) => {
                    const { id, sku, name, trackInventory, stocks, channelListings } = item;
                    return {
                        id,
                        sku,
                        name,
                        stackMgmt: trackInventory,
                        quantity: stocks?.[0]?.quantity || 0,
                        regularPrice: channelListings?.[0]?.costPrice?.amount || 0,
                        salePrice: channelListings?.[0]?.price?.amount || 0,
                        channelId: channelListings?.[0]?.id || '',
                        stockId: stocks?.[0]?.id || '',
                    };
                });
                setState({ variants });
            }
            if (response?.tags?.length > 0) {
                const tags: any = response?.tags?.map((item: any) => ({ value: item.id, label: item.name }));
                setState({ tags });
            }

            if (response?.category?.length > 0) {
                const category: any = response?.category?.map((item: any) => ({ value: item.id, label: item.name }));
                setState({ categories: category });
            }
            setState({ publish: response?.channelListings[0]?.isPublished == true ? 'published' : 'draft', menuOrder: response?.orderNo });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const tags_list = async () => {
        try {
            const res: any = await tagsListRefetch({ channel: 'india-channel', id: data?.id, first: 100 });
            if (res?.data?.tags?.edges?.length > 0) {
                const list = res?.data?.tags?.edges;
                const dropdownData = list?.map((item: any) => {
                    return { value: item.node?.id, label: item.node?.name };
                });
                setState({ tagsOption: dropdownData });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const cat_list = async () => {
        try {
            const res: any = await catListRefetch({
                variables: { channel: 'india-channel' },
            });

            if (res?.data?.categories?.edges?.length > 0) {
                const list = res?.data?.categories?.edges;
                const dropdownData = list?.map((item: any) => {
                    return { value: item.node?.id, label: item.node?.name };
                });
                setState({ categoriesOption: dropdownData });
            }
        } catch (error) {
            console.log('error: ', error);
        }
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
            setState({ variants: state.variants.filter((_, i) => i !== index) });
            // setVariants((prevItems) => prevItems.filter((_, i) => i !== index));
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleVariantChange = (index: any, fieldName: any, fieldValue: any) => {
        const states = [...state.variants];
        states[index][fieldName] = fieldValue;
        setState({ variants: states });
    };

    const handleVariantAdd = () => {
        setState({
            variants: [
                ...state.variants,
                {
                    sku: '',
                    stackMgmt: false,
                    quantity: 0,
                    regularPrice: 0,
                    salePrice: 0,
                    channelId: '',
                },
            ],
        });
    };

    const validateVariants = () => {
        return state.variants.map((variant) => {
            const errors: any = {};
            if (!variant.sku) errors.sku = 'SKU cannot be empty';
            // if (variant.quantity <= 0 || isNaN(variant.quantity)) errors.quantity = 'Quantity must be a valid number and greater than 0';
            if (variant.regularPrice <= 0 || isNaN(variant.regularPrice)) errors.regularPrice = 'Price must be a valid number and greater than 0';
            // if (!variant.stackMgmt) errors.stackMgmt = 'Check Stack Management';
            return errors;
        });
    };

    const updateProducts = async () => {
        try {
            setState({ loading: true });
            const errors = {
                productName: state.name.trim() === '' ? 'Product name cannot be empty' : '',
                category: state.categories?.length === 0 ? 'Category cannot be empty' : '',
            };

            if (state.publish != 'draft') {
                const variantErrors = validateVariants();
                setState({ error: errors, variantError: variantErrors });
                if (Object.values(errors).some((msg) => msg !== '') || variantErrors.some((err) => Object.keys(err).length > 0)) {
                    setState({ loading: false });
                    Failure('Please fill in all required fields');
                } else {
                    await commonFunction();
                }
            } else {
                await commonFunction();
            }
        } catch (error) {
            setState({ loading: false });
        } finally {
        }
    };

    const commonFunction = async () => {
        let upsells = [];
        if (state.productData?.getUpsells?.length > 0) {
            upsells = state.productData?.getUpsells?.map((item: any) => item?.productId);
        }
        let crosssells = [];
        if (state.productData?.getCrosssells?.length > 0) {
            crosssells = state.productData?.getCrosssells?.map((item: any) => item?.productId);
        }

        // let finish = [];
        // if (state.productData?.productFinish?.length > 0) {
        //     finish = state.productData?.productFinish?.map((item: any) => item.id);
        // }

        // let design = [];
        // if (state.productData?.prouctDesign?.length > 0) {
        //     design = state.productData?.prouctDesign?.map((item: any) => item.id);
        // }

        // let style = [];
        // if (state.productData?.productstyle?.length > 0) {
        //     style = state.productData?.productstyle?.map((item: any) => item.id);
        // }

        // let stone = [];
        // if (state.productData?.productStoneType?.length > 0) {
        //     stone = state.productData?.productStoneType?.map((item: any) => item.id);
        // }

        // let size = [];
        // if (state.productData?.productSize?.length > 0) {
        //     size = state.productData?.productSize?.map((item: any) => item.id);
        // }

        const finalArray = state.productData?.attributes?.reduce((acc, attr) => {
            if (attr?.values?.length > 0) {
                acc.push({
                    id: attr?.attribute?.id,
                    values: attr?.values?.map((value) => value?.slug), // extracting the slug of each value
                });
            }
            return acc;
        }, []);
        const tagId = state.tags?.map((item) => item.value) || [];

        const input = {
            attributes: finalArray,
            category: state.categories?.map((item) => item?.value),
            collections: state.productData?.collections.map((item) => item.id),
            tags: tagId,
            name: state.name,
            description: state.productData?.description,
            rating: 0,
            seo: {
                description: state.productData?.seoDescription,
                title: state.productData?.seoTitle,
            },
            upsells,
            crosssells,
            slug: state.productData?.slug,
            order_no: state.menuOrder,
            // prouctDesign: design,
            // productstyle: style,
            // productFinish: finish,
            // productStoneType: stone,
            // productSize: size,
        };

        const res = await updateProduct({
            variables: {
                id: data?.id,
                input,
                firstValues: 10,
            },
        });

        if (res?.data?.productUpdate?.errors?.length > 0) {
            Failure(data?.productUpdate?.errors[0]?.message);
            setState({ loading: false });
        } else {
            productChannelListUpdate();
        }
    };

    const productChannelListUpdate = async () => {
        try {
            const res = await updateProductChannelList({
                variables: {
                    id: data?.id,
                    input: {
                        updateChannels: [
                            {
                                availableForPurchaseDate: null,
                                channelId: 'Q2hhbm5lbDoy',
                                isAvailableForPurchase: true,
                                isPublished: state.publish == 'draft' ? false : true,
                                publicationDate: null,
                                visibleInListings: true,
                            },
                        ],
                    },
                },
            });
            if (res?.data?.productChannelListingUpdate?.errors?.length > 0) {
                Failure(data?.productChannelListingUpdate?.errors[0]?.message);
                setState({ loading: false });
            } else {
                variantListUpdate();
            }
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const variantListUpdate = async () => {
        try {
            const arrayOfVariants = state.variants?.map((item: any) => ({
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

            const NewAddedVariant = state.variants.filter((item) => item.id == undefined || item.id == '');

            const updateArr = arrayOfVariants.filter((item) => item.id != undefined || item.id != '');

            if (NewAddedVariant?.length > 0) {
                bulkVariantCreate(NewAddedVariant);
            } else {
                const res = await updateVariant({
                    variables: {
                        product: data?.id,
                        input: updateArr,
                        errorPolicy: 'REJECT_FAILED_ROWS',
                    },
                });

                if (res?.data?.productVariantBulkUpdate?.errors?.length > 0) {
                    setState({ loading: false });
                    Failure(res?.data?.productVariantBulkUpdate?.errors[0]?.message);
                } else if (res?.data?.productVariantBulkUpdate?.results[0]?.errors?.length > 0) {
                    setState({ loading: false });
                    Failure(res?.data?.productVariantBulkUpdate?.results[0]?.errors[0]?.message);
                } else {
                    const results = res?.data?.productVariantBulkUpdate?.results || [];
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
                                // updateMetaData();
                            }
                        }
                    } else {
                        if (NewAddedVariant?.length === 0) {
                            // updateMetaData();
                        }
                    }
                    closeExpand();
                    updateList();
                    setState({ loading: false });
                }
            }
        } catch (error) {
            setState({ loading: false });

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
                        quantity: item.quantity,
                    },
                ],
            }));

            const res = await createVariant({
                variables: {
                    id: data?.id,
                    inputs: variantArr,
                },
            });

            if (res?.data?.productVariantBulkCreate?.errors?.length > 0) {
                setState({ loading: false });

                Failure(res?.data?.productVariantBulkCreate?.errors[0]?.message);
            } else {
                const resVariants = res?.data?.productVariantBulkCreate?.productVariants;
                if (resVariants?.length > 0) {
                    resVariants?.map((item: any) => {
                        variantChannelListUpdate(item.id, NewAddedVariant);
                    });
                    setState({ loading: false });
                } else {
                    setState({ loading: false });

                    closeExpand();
                    updateList();
                }
            }
        } catch (error) {
            setState({ loading: false });

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
            });
            if (data?.productVariantChannelListingUpdate?.errors?.length > 0) {
                Failure(data?.productVariantChannelListingUpdate?.errors[0]?.message);
                setState({ loading: false });
            } else {
                closeExpand();

                updateList();
                setState({ loading: false });
            }
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    return (
        <div className="panel mt-1">
            <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                QUICK EDIT
            </label>

            <div className="panel mb-5 flex flex-col gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Product Name
                    </label>
                    <input type="text" value={state.name} onChange={(e) => setState({ name: e.target.value })} placeholder="Enter Your Name" name="name" className="form-input" required />
                    {state.error?.productName && <p className="error-message mt-1 text-red-500">{state.error?.productName}</p>}
                </div>

                <div>
                    <label className="block pr-5 text-lg font-medium text-gray-700">Variants</label>
                    {state?.variants?.map((item, index) => {
                        return (
                            <div key={index} className=" border-b border-gray-200">
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
                                            onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
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
                                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                            style={{ width: '100%' }}
                                            placeholder="Enter SKU"
                                            className="form-input"
                                        />

                                        {state.variantError[index]?.sku && <p className="error-message mt-1 text-red-500">{state.variantError[index].sku}</p>}

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
                                            onChange={(e) => handleVariantChange(index, 'stackMgmt', e.target.checked)}
                                            className="form-checkbox"
                                        />
                                        <span>Track stock quantity for this product</span>
                                        {/* {variantErrors[index]?.stackMgmt && <p className="error-message mt-1 text-red-500">{variantErrors[index].stackMgmt}</p>} */}
                                    </div>
                                </div>
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
                                            onChange={(e) => handleVariantChange(index, 'quantity', parseInt(e.target.value))}
                                            style={{ width: '100%' }}
                                            placeholder="Enter Quantity"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
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
                                            onChange={(e) => handleVariantChange(index, 'regularPrice', parseFloat(e.target.value))}
                                            style={{ width: '100%' }}
                                            placeholder="Enter Regular Price"
                                            className="form-input"
                                        />
                                        {state.variantError[index]?.regularPrice && <p className="error-message mt-1 text-red-500">{state.variantError[index].regularPrice}</p>}
                                    </div>
                                </div>
                                {index !== 0 && ( // Render remove button only for items after the first one
                                    <div className="active mb-4 flex items-center  text-danger ">
                                        <button className="" onClick={() => handleRemoveVariants(item, index)}>
                                            <IconTrashLines />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="mb-5 mt-3">
                        <button type="button" className=" btn btn-primary flex justify-end" onClick={handleVariantAdd}>
                            Add item
                        </button>
                    </div>
                </div>
                <div className="flex gap-5">
                    <div className="w-6/12">
                        <div>
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Tags</h5>
                            </div>
                            <div className="mb-5">
                                <TagSelect loading={tagloading} queryFunc={fetchTag} selectedCategory={state.tags} onCategoryChange={(data) => setState({ tags: data })} />

                                {/* <Select placeholder="Select an tags" isMulti options={state.tagsOption} value={state.tags} onChange={(data: any) => setState({ tags: data })} isSearchable={true} /> */}
                            </div>
                        </div>
                    </div>
                    <div className="w-6/12">
                        <div>
                            <div className="mb-5 border-b border-gray-200 pb-2">
                                <h5 className=" block text-lg font-medium text-gray-700">Product Categories</h5>
                            </div>
                            <div className="mb-5">
                                <CategorySelect
                                    queryFunc={fetchCategories} // Pass the function to fetch categories
                                    selectedCategory={state.categories} // Use 'selectedCategory' instead of 'value'
                                    onCategoryChange={(data) => setState({ categories: data })} // Use 'onCategoryChange' instead of 'onChange'
                                    placeholder="Select categories"
                                />
                                {/* <Select
                                    placeholder="Select Categories"
                                    isMulti
                                    options={state.categoriesOption}
                                    value={state.categories}
                                    onChange={(data: any) => setState({ categories: data })}
                                    isSearchable={true}
                                /> */}
                                {state.error?.category && <p className="error-message mt-1 text-red-500">{state.error?.category}</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex w-full gap-5">
                    <div className="active w-6/12  items-center">
                        <h5 className=" block text-lg font-medium text-gray-700">Status</h5>
                        <div className="mb-5 w-full pr-3">
                            <select className="form-select  flex-1 " value={state.publish} onChange={(e) => setState({ publish: e.target.value })}>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                    <div className="active w-6/12  items-center">
                        <h5 className=" block text-lg font-medium text-gray-700">Menu Order</h5>
                        <div className="mb-5 w-full pr-3">
                            <input
                                type="number"
                                name={`menuOrder`}
                                value={state.menuOrder}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setState({ menuOrder: value === '' ? null : value });
                                }}
                                // onChange={(e) => setState({ menuOrder: e.target.value })}
                                style={{ width: '100%' }}
                                placeholder="Product Order Number"
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>
                <div className="mb-5 flex gap-5">
                    <button type="button" className=" btn btn-primary flex justify-end" onClick={updateProducts}>
                        {state.loading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
                    </button>
                    <button type="button" className=" btn btn-outline-primary flex justify-end" onClick={() => closeExpand()}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
