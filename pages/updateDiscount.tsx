import { Failure, Success, USDAmt, capitalizeFLetter, dropdown, formatDateTimeLocal, generateRandomCode, isEmptyObject, useSetState } from '@/utils/functions';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Modal from '@/components/Modal';
import { DataTable, DataTableProps } from 'mantine-datatable';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import Select from 'react-select';
import { useMutation, useQuery } from '@apollo/client';
import {
    ASSIGN_DISCOUNT,
    ASSIGN_TO_COUPON,
    COUPEN_DETAILS,
    COUPON_CHANNEL_UPDATE,
    COUPON_CODES,
    COUPON_META_DATA,
    CREATE_COUPEN,
    DISCOUNT_DETAILS,
    NEW_PARENT_CATEGORY_LIST,
    PRODUCT_BY_NAME,
    REMOVE_DISCOUNT_DATA,
    REMOVE_TO_COUPON,
    SEARCH_CATEGORIES,
    SEARCH_PRODUCT,
    UPDATED_PRODUCT_PAGINATION,
    UPDATE_COUPON,
    UPDATE_DISCOUNT,
    UPDATE_DISCOUNT_CHANNEL,
    UPDATE_DISCOUNT_METADATA,
} from '@/query/product';
import { Description } from '@headlessui/react/dist/components/description/description';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import IconLoader from '@/components/Icon/IconLoader';
import CategorySelect from '@/components/CategorySelect';
import ProductSelect from '@/components/ProductSelect';

const EditCoupon = () => {
    const router = useRouter();
    const id = router?.query?.id;
    const [updateDiscount, { loading: updateDisLoding }] = useMutation(UPDATE_DISCOUNT);
    const [channelUpdate, { loading: chennelLoading }] = useMutation(UPDATE_DISCOUNT_CHANNEL);
    const { data: discountDetail, refetch: discountRefetch, loading } = useQuery(DISCOUNT_DETAILS);
    const { data: productCat, refetch: categorySearchRefetch } = useQuery(SEARCH_CATEGORIES);
    const { data: productSearch, refetch: productSearchRefetch } = useQuery(PRODUCT_BY_NAME);
    const [removeDataFromCoupon, { loading: removeLoading }] = useMutation(REMOVE_DISCOUNT_DATA);

    const [assignDataRefetch, { loading: assignLoading }] = useMutation(ASSIGN_DISCOUNT);
    const [metaData, { loading: metaLoading }] = useMutation(UPDATE_DISCOUNT_METADATA);

    const { refetch: categoryRefetch } = useQuery(NEW_PARENT_CATEGORY_LIST, {
        variables: { channel: 'india-channel' },
    });

    const { data, refetch: productListSearchRefetch, loading: productLoading } = useQuery(UPDATED_PRODUCT_PAGINATION);

    const fetchCategories = async (variables) => {
        return await categoryRefetch(variables);
    };

    const fetchProducts = async (variables) => {
        return await productListSearchRefetch(variables);
    };

    const [state, setState] = useSetState({
        couponName: '',
        nameError: '',
        couponNameErr: '',
        codeOption: [],
        couponValue: '',
        isEndDate: false,
        startDate: null,
        endDate: '',
        description: '',
        specificInfoOption: [],
        specificInfo: '',
        productSearch: '',
        codeType: '',
        catOption: [],
        selectedCategory: [],
        selectedProduct: [],
        searchProduct: '',
        productList: [],
        oldCat: [],
        oldProduct: [],
    });

    useEffect(() => {
        codeType();
        getDetails();
        categoryList();
    }, [id, discountDetail]);

    useEffect(() => {
        getProductByName();
    }, [state.searchProduct]);

    const getDetails = async () => {
        try {
            const res = await discountRefetch({
                id,
                first: 20,
                includeCategories: true,
                includeCollections: false,
                includeProducts: true,
                includeVariants: false,
            });
            const data = res?.data?.sale;
            const endDate = data?.endDate;
            if (endDate) {
                setState({ isEndDate: true, endDate: formatDateTimeLocal(endDate) });
            }
            let category = data?.categories?.edges;
            if (category?.length > 0) {
                const res = category?.map((item) => item?.node)?.map((val) => ({ value: val?.id, label: val?.name }));
                setState({ selectedCategory: res, oldCat: res });
            }

            let product = data?.products?.edges;
            if (product?.length > 0) {
                const res = product?.map((item) => item?.node)?.map((val) => ({ value: val?.id, label: val?.name }));
                setState({ selectedProduct: res, oldProduct: res });
            }
            if (data?.metadata?.length > 0) {
                setState({ description: data?.metadata[0]?.value });
            }
            setState({
                couponName: data?.name,
                codeType: data.type === 'FIXED' ? { value: 'Fixed Amount', label: 'Fixed Amount' } : { value: 'Percentage', label: 'Percentage' },
                couponValue:
                    data.type === 'FIXED'
                        ? data?.channelListings?.find((item) => item.channel?.currencyCode == 'INR')?.discountValue
                        : data?.channelListings?.find((item) => item.channel?.currencyCode == 'USD')?.discountValue,
                startDate: data?.startDate ? new Date(data?.startDate).toISOString().slice(0, 16) : null,
                specificInfo: data?.categories != null || data?.products != null ? { value: 'Specific products', label: 'Specific products' } : { value: 'All products', label: 'All products' },
            });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getProductByName = async () => {
        try {
            const res = await productSearchRefetch({
                name: state.searchProduct,
            });

            const response = res?.data?.products?.edges;
            const dropdownData = response?.map((item: any) => ({ value: item?.node?.id, label: item?.node?.name }));
            setState({ productList: dropdownData });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleStartDateChange = (e) => {
        setState({
            startDate: e.target.value,
            endDate: '', // Clear endDate when startDate changes
        });
    };

    const handleEndDateChange = (e) => {
        setState({
            endDate: e.target.value,
        });
    };

    const updateCoupon = async () => {
        try {
            let errors: any = {};

            const { couponName, generatedCodes, codeType, couponValue, minimumReq, minimumReqValue, usageLimit, usageValue, isEndDate, endDate, startDate, maxReqValue, maxReqValueError, maxReq } =
                state;

            if (!couponName) {
                errors.nameError = 'Coupon name is required';
            }

            if (couponValue == '') {
                errors.couponValueError = 'Coupon value is required';
            }

            if (isEndDate && !endDate) {
                errors.endDateError = 'End date is required';
            }

            if (Object.keys(errors).length > 0) {
                setState({ errors });
                return;
            }
            const body = {
                name: state.couponName,
                type: state.codeType?.value == 'Fixed Amount' ? 'FIXED' : 'PERCENTAGE',
                endDate: state.isEndDate ? new Date(state.endDate).toISOString() : null,
                startDate: state.startDate ? new Date(state.startDate).toISOString() : null,
            };

            const res = await updateDiscount({
                variables: {
                    id,
                    input: body,
                    channelInput: {
                        addChannels: [
                            {
                                channelId: 'Q2hhbm5lbDox',
                                // discountValue: state.couponValue,
                                discountValue:
                                    state.codeType?.value == 'Free Shipping'
                                        ? '100'
                                        : state.codeType?.value == 'Fixed Amount'
                                        ? Number((Number(state.couponValue) * USDAmt).toFixed(2))
                                        : state.codeType?.value == 'Percentage'
                                        ? state.couponValue
                                        : null,
                            },
                            {
                                channelId: 'Q2hhbm5lbDoy',
                                // discountValue: state.couponValue,
                                discountValue: state.codeType?.value == 'Free Shipping' ? '100' : Number(state.couponValue),
                            },
                        ],
                        removeChannels: [],
                    },
                },
            });
            if (res?.data?.saleChannelListingUpdate?.errors?.length > 0) {
                Failure(res?.data?.saleChannelListingUpdate?.errors[0]?.message);
            } else {
                // const discountId = res?.data?.saleChannelListingUpdate?.sale?.id;
                // if (state.description !== '') {
                updateMetaData(id);
                // }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const extraDatas = (id: any) => {
        const oldCat = state.oldCat?.map((val) => val.value) || [];
        const selectedCategory = state.selectedCategory?.map((val) => val.value) || [];

        const oldProduct = state.oldProduct?.map((val) => val.value) || [];
        const selectedProduct = state.selectedProduct?.map((val) => val.value) || [];

        const newlyAddedCat = selectedCategory.filter((item) => !oldCat.includes(item));
        const removedCat = oldCat.filter((item) => !selectedCategory.includes(item));

        const newlyAddedProduct = selectedProduct.filter((item) => !oldProduct.includes(item));
        const removedProduct = oldProduct.filter((item) => !selectedProduct.includes(item));

        if (newlyAddedCat?.length > 0 || newlyAddedProduct?.length > 0) {
            assignData(id, newlyAddedCat, newlyAddedProduct);
        }
        if (removedCat?.length > 0 || removedProduct?.length > 0) {
            removeData(id, removedCat, removedProduct);
        }

        router.push(`/discount`);
        Success('Discount Updated Successfully');
    };

    const updateMetaData = async (id: any) => {
        try {
            const res = await metaData({
                variables: {
                    id,
                    input: [
                        {
                            key: 'description',
                            value: state.description,
                        },
                    ],
                    keysToDelete: [],
                },
            });
            extraDatas(id);
            // router.push(`/discount`);
            // Success('Discount Updated Successfully');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const assignData = async (id: any, categories: any, products: any) => {
        try {
            const res = await assignDataRefetch({
                variables: {
                    first: 20,
                    includeCategories: true,
                    includeCollections: false,
                    includeProducts: true,
                    includeVariants: false,
                    id,
                    input: {
                        categories,
                        products,
                    },
                },
            });

            setState({ selectedCategory: [], selectedProduct: [] });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const removeData = async (id: any, categories: any, products: any) => {
        try {
            const res = await removeDataFromCoupon({
                variables: {
                    first: 20,
                    includeCategories: true,
                    includeCollections: false,
                    includeProducts: true,
                    includeVariants: false,
                    id,
                    input: {
                        categories,
                        products,
                    },
                },
            });

            setState({ selectedCategory: [], selectedProduct: [] });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const codeType = () => {
        const arr = ['Fixed Amount', 'Percentage'];
        const specificInfo = ['All products', 'Specific products'];
        const type = dropdown(arr);
        const type3 = dropdown(specificInfo);
        setState({ codeOption: type, specificInfoOption: type3 });
    };

    const categoryList = async () => {
        const res = await categorySearchRefetch({
            after: null,
            first: 500,
            query: '',
        });
        const datas = res?.data?.search?.edges?.map((item) => item?.node)?.map((val) => ({ value: val?.id, label: val?.name }));

        setState({ catOption: datas });
    };

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-5">
                <h5 className="text-lg font-semibold dark:text-white-light">Edit Discount</h5>
            </div>
            <div className="panel mb-5 flex ">
                <div className="flex w-full flex-wrap  items-center ">
                    <div className="w-full md:w-6/12">
                        <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                            Discount Name
                        </label>
                        <input
                            type="text"
                            value={state.couponName}
                            onChange={(e) => setState({ couponName: e.target.value })}
                            placeholder="Enter Discount Name"
                            name="name"
                            className="form-input"
                            required
                        />
                        {state.errors?.nameError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.nameError}</p>}
                    </div>
                </div>
            </div>

            <div className="panel mt-5">
                <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    id="ctnTextarea"
                    value={state.description}
                    onChange={(e) => setState({ description: e.target.value })}
                    rows={3}
                    className="form-textarea"
                    placeholder="Enter Description"
                    required
                ></textarea>
            </div>
            <div className="panel mt-5 flex w-full gap-5 pt-5">
                <div className="col-6 md:w-6/12">
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                        Discount Type
                    </label>
                    <Select
                        placeholder="Discount Type"
                        options={state.codeOption}
                        value={state.codeType}
                        onChange={(e) => {
                            setState({ codeType: e });
                        }}
                        isSearchable={false}
                    />
                </div>

                <div className="col-6 md:w-6/12">
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                        Value
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={state.couponValue}
                            onChange={(e) => setState({ couponValue: e.target.value, errors: { couponValueError: '' } })}
                            placeholder="Enter Discount Value"
                            name="name"
                            className="form-input"
                            required
                        />
                        {state.codeType?.value == 'Percentage' && (
                            <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                                %
                            </label>
                        )}
                    </div>
                    {state.errors?.couponValueError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.couponValueError}</p>}
                </div>
            </div>
            <div className="panel mt-4  gap-5">
                <div className="mt-5 flex w-full gap-5">
                    <div className="col-6 md:w-6/12">
                        <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                            Products
                        </label>
                        {/* <Select
                            placeholder="Select a product"
                            options={state.productList}
                            value={state.selectedProduct}
                            onChange={(data) => setState({ selectedProduct: data })}
                            isSearchable={true}
                            isMulti={true}
                            onInputChange={(inputValue) => setState({ searchProduct: inputValue })}
                        /> */}
                        <ProductSelect loading={productLoading} queryFunc={fetchProducts} selectedCategory={state.selectedProduct} onCategoryChange={(data) => setState({ selectedProduct: data })} />
                    </div>
                    <div className="col-6 md:w-6/12">
                        <CategorySelect
                            queryFunc={fetchCategories} // Pass the function to fetch categories
                            placeholder="Select categories"
                            title="Categories"
                            selectedCategory={state.selectedCategory}
                            onCategoryChange={(data: any) => setState({ selectedCategory: data })}
                        />
                        {/* <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                            Categories
                        </label>
                        <Select
                            placeholder="Select categories"
                            options={state.catOption}
                            value={state.selectedCategory}
                            onChange={(data: any) => setState({ selectedCategory: data })}
                            isSearchable={true}
                            isMulti={true} */}
                        {/* /> */}
                    </div>
                </div>

                <div className="  mt-5 flex w-full gap-5">
                    <div className="col-6 md:w-6/12">
                        <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                            Active Dates
                        </label>

                        <input
                            value={state.startDate}
                            onChange={handleStartDateChange}
                            type="datetime-local"
                            id="startDate"
                            name="startDate"
                            className="form-input"
                            required
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>
                    <div className="col-6 flex flex-col  justify-center md:w-6/12">
                        <div className="mb-3 flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={state.isEndDate}
                                onChange={(e) => setState({ isEndDate: e.target.checked })}
                                className="form-checkbox border-white-light dark:border-white-dark ltr:mr-0 rtl:ml-0"
                            />
                            <h3 className="text-md font-semibold dark:text-white-light">End Date</h3>
                        </div>
                        {state.isEndDate && (
                            <>
                                <input
                                    value={state.endDate}
                                    onChange={handleEndDateChange}
                                    type="datetime-local"
                                    id="endDate"
                                    name="endDate"
                                    className="form-input"
                                    required
                                    min={state.startDate}
                                    max={new Date(new Date(state.startDate).setFullYear(new Date(state.startDate).getFullYear() + 1)).toISOString().slice(0, 16)}
                                />
                                {state.errors?.endDateError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.endDateError}</p>}
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-4">
                    <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => updateCoupon()}>
                        {updateDisLoding || assignLoading || removeLoading || metaLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                    </button>
                    <button type="button" className="btn btn-danger  w-full md:mb-0 md:w-auto" onClick={() => router.push('/discount')}>
                        {'Cancel'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default PrivateRouter(EditCoupon);
