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
    ASSIGN_TO_COUPON,
    CATEGORY_LIST,
    COUPEN_DETAILS,
    COUPON_CHANNEL_UPDATE,
    COUPON_CODES,
    COUPON_META_DATA,
    CREATE_COUPEN,
    NEW_PARENT_CATEGORY_LIST,
    PRODUCT_BY_NAME,
    REMOVE_TO_COUPON,
    SEARCH_CATEGORIES,
    SEARCH_PRODUCT,
    UPDATED_PRODUCT_PAGINATION,
    UPDATE_COUPON,
} from '@/query/product';
import { Description } from '@headlessui/react/dist/components/description/description';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import IconLoader from '@/components/Icon/IconLoader';
import CategorySelect from '@/components/CategorySelect';
import ProductSelect from '@/components/ProductSelect';

const EditCoupon = () => {
    const router = useRouter();
    const id = router?.query?.id;
    const [updateCoupons] = useMutation(UPDATE_COUPON);
    const [channelUpdate, { loading: chennelLoading }] = useMutation(COUPON_CHANNEL_UPDATE);
    const { data: couponDetail, refetch: coupenRefetch, loading } = useQuery(COUPEN_DETAILS);
    const { data: productCat, refetch: categorySearchRefetch } = useQuery(NEW_PARENT_CATEGORY_LIST);
    const { data: productSearch, refetch: productSearchRefetch } = useQuery(PRODUCT_BY_NAME);
    const [removeDataFromCoupon, { loading: removeLoading }] = useMutation(REMOVE_TO_COUPON);

    const [assignDataRefetch, { loading: assignLoading }] = useMutation(ASSIGN_TO_COUPON);
    const [metaData, { loading: metaLoading }] = useMutation(COUPON_META_DATA);

    const { data, refetch: productListSearchRefetch, loading: productLoading } = useQuery(UPDATED_PRODUCT_PAGINATION);

    const { data: codeList, refetch: codeListRefetch } = useQuery(COUPON_CODES);

    const fetchCategories = async (variables) => {
        return await categorySearchRefetch(variables);
    };

    const fetchProducts = async (variables) => {
        return await productListSearchRefetch(variables);
    };

    const [state, setState] = useSetState({
        couponName: '',
        nameError: '',
        visible: false,
        typeOfCode: '',
        isOpen: false,
        couponNameErr: '',
        autoCode: false,
        autoCodeNumber: '',
        autoCodeNumberErr: '',
        generatedCodes: [],
        codeOption: [],
        minimumReqOption: [],
        usageOption: [],
        couponValue: '',
        usageLimit: null,
        minimumReq: '',
        minimumReqValue: '',
        usageValue: '',
        isEndDate: false,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: '',
        description: '',
        specificInfoOption: [],
        specificInfo: '',
        productSearch: '',
        codeType: '',
        oldCodes: [],
        catOption: [],
        selectedCategory: [],
        selectedProduct: [],
        selectedExcludeCategory: [],
        searchProduct: '',
        productList: [],
        oldCat: [],
        oldProduct: [],
        oldExcludeCat: [],
        autoApply: false,
        invidual: false,
        maxReq: { value: 'None', label: 'None' },
        maxReqOption: [],
        maxReqValueError: '',
        maxReqValue: '',
    });

    useEffect(() => {
        codeType();
        getDetails();
        couponCodeList();
        // categoryList();
    }, [id, codeList, couponDetail]);

    useEffect(() => {
        getProductByName();
    }, [state.searchProduct]);

    const getDetails = async () => {
        try {
            const res = await coupenRefetch({
                id,
                first: 20,
                includeCategories: true,
                includeCollections: false,
                includeProducts: true,
            });
            const data = res?.data?.voucher;
            const endDate = data?.endDate;
            if (endDate) {
                setState({ isEndDate: true, endDate: formatDateTimeLocal(endDate) });
            }
            let category = data?.categories?.edges;
            if (category?.length > 0) {
                const res = category?.map((item) => item?.node)?.map((val) => ({ value: val?.id, label: val?.name }));
                setState({ selectedCategory: res, oldCat: res });
            }

            let excludeCategories = data?.excludeCategories?.edges;
            if (excludeCategories?.length > 0) {
                const res = excludeCategories?.map((item) => item?.node)?.map((val) => ({ value: val?.id, label: val?.name }));
                setState({ selectedExcludeCategory: res, oldExcludeCat: res });
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
                autoApply: data?.autoApply,
                invidual: data?.invidualUseOnly,
                codeType:
                    data?.type === 'SPECIFIC_PRODUCT' || data?.type === 'ENTIRE_ORDER'
                        ? data.discountValueType === 'FIXED'
                            ? { value: 'Fixed Amount', label: 'Fixed Amount' }
                            : data.discountValueType === 'PERCENTAGE'
                            ? { value: 'Percentage', label: 'Percentage' }
                            : null
                        : data?.type === 'SHIPPING'
                        ? { value: 'Free Shipping', label: 'Free Shipping' }
                        : null,

                startDate: formatDateTimeLocal(data?.startDate),
                couponValue: data?.type == 'SHIPPING' ? null : data?.channelListings[1]?.discountValue,
                usageValue: data?.usageLimit,
                specificInfo: data?.type == 'SPECIFIC_PRODUCT' ? { value: 'Specific products', label: 'Specific products' } : { value: 'All products', label: 'All products' },
                minimumReq:
                    data?.channelListings[1]?.minSpent == null
                        ? { value: 'None', label: 'None' }
                        : data?.minCheckoutItemsQuantity !== 0
                        ? { value: 'Minimum quantity of items', label: 'Minimum quantity of items' }
                        : { value: 'Minimal order value', label: 'Minimal order value' },
                usageLimit: data?.applyOncePerCustomer
                    ? { value: 'Limit to one use per customer', label: 'Limit to one use per customer' }
                    : data?.onlyForStaff
                    ? { value: 'Limit to staff only', label: 'Limit to staff only' }
                    : data?.singleUse
                    ? { value: 'Limit to voucher code use once', label: 'Limit to voucher code use once' }
                    : { value: 'Limit number of times this discount can be used in total', label: 'Limit number of times this discount can be used in total' },
                minimumReqValue: data?.channelListings[0]?.minSpent == null ? null : data?.minCheckoutItemsQuantity !== 0 ? data?.minCheckoutItemsQuantity : data?.channelListings[1]?.minSpent?.amount,
                maxReqValue: data?.channelListings[0]?.maxSpent == null ? null : data?.channelListings[1]?.maxSpent?.amount,
                maxReq: data?.channelListings[1]?.maxSpent == null ? { value: 'None', label: 'None' } : { value: 'Maximum order value', label: 'Maximum order value' },
            });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const couponCodeList = async () => {
        try {
            const res = await codeListRefetch({
                id,
                first: 100,
            });

            const data = res?.data?.voucher?.codes?.edges?.map((item: any) => item?.node)?.map((item: any) => item.code);
            setState({ generatedCodes: data, oldCodes: data });
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

    const handleMenuClick = (e) => {
        setState({ visible: false, typeOfCode: e.key });
        if (e.key === 'manual') {
            setState({ isOpen: true, couponNameErr: '', couponName: '' });
        } else {
            setState({ autoCode: true, autoCodeNumber: '', autoCodeNumberErr: '' });
        }
    };

    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="manual">Manual</Menu.Item>
            <Menu.Item key="auto">Auto Generate</Menu.Item>
        </Menu>
    );

    const addManualCode = () => {
        if (state.couponName == '') {
            setState({ couponNameErr: 'Please enter coupon code' });
        } else {
            setState({ isOpen: false, couponNameErr: '', couponName: '', generatedCodes: [...state.generatedCodes, state.couponName] });
        }
    };

    const addGenerateCode = () => {
        if (state.autoCodeNumber == '') {
            setState({ autoCodeNumberErr: 'Please enter coupon code quantity' });
        } else {
            const quantity = parseInt(state.autoCodeNumber, 10);
            if (isNaN(quantity) || quantity <= 0 || quantity > 50) {
                setState((prevState) => ({
                    ...prevState,
                    autoCodeNumberErr: 'Please enter a valid number between 1 and 50',
                }));
                return;
            }
            const codes = Array.from({ length: quantity }, generateRandomCode);
            setState({
                generatedCodes: [...state.generatedCodes, ...codes],
                autoCodeNumberErr: '',
                autoCode: false,
            });
        }
    };

    const deleteCode = (row) => {
        const filter = state.generatedCodes?.filter((item) => item !== row);
        setState({ generatedCodes: filter });
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
            if (generatedCodes.length === 0) {
                errors.generatedCodesError = 'At least one coupon code is required';
            }
            if (codeType.value !== 'Free Shipping' && !couponValue) {
                errors.couponValueError = 'Coupon value is required';
            }
            if (minimumReq.value !== 'None' && !minimumReqValue) {
                errors.minimumReqValueError = 'Minimum requirement value is required';
            }
            if (maxReq.value !== 'None' && !maxReqValue) {
                errors.maxReqValueError = 'Maximum requirement value is required';
            }
            // if (usageLimit.value === 'Limit number of times this discount can be used in total' && !usageValue) {
            //     errors.usageValueError = 'Usage limit value is required';
            // }
            if (isEndDate && !endDate) {
                errors.endDateError = 'End date is required';
            }

            if (Object.keys(errors).length > 0) {
                setState({ errors });
                return;
            }
            const set1 = new Set(state.oldCodes);
            const pendingList = state.generatedCodes.filter((item) => !set1.has(item));
            const body = {
                name: state.couponName,
                applyOncePerCustomer: state.usageLimit?.value == 'Limit to one use per customer' ? true : false,
                // applyOncePerOrder: state.usageLimit?.value == 'Limit to one use per customer' ? true : false,
                applyOncePerOrder: false,
                onlyForStaff: state.usageLimit?.value == 'Limit to staff only' ? true : false,
                addCodes: pendingList,
                discountValueType: state.codeType?.value == 'Fixed Amount' ? 'FIXED' : 'PERCENTAGE',
                endDate: state.isEndDate ? state.endDate : null,
                minCheckoutItemsQuantity: state.minimumReq?.value == 'Minimum quantity of items' ? state.minimumReqValue : 0,
                startDate: state.startDate,
                type: state.codeType?.value == 'Free Shipping' ? 'SHIPPING' : state.specificInfo?.value == 'Specific products' ? 'SPECIFIC_PRODUCT' : 'ENTIRE_ORDER',
                usageLimit: state.usageLimit?.value == 'Limit number of times this discount can be used in total' ? (state.usageValue ? state.usageValue : null) : null,
                singleUse: state.usageLimit?.value == 'Limit to voucher code use once' ? true : false,
                autoApply: state?.autoApply,
                invidualUseOnly: state.invidual,
            };

            const res = await updateCoupons({
                variables: {
                    id,
                    input: body,
                },
            });
            if (res?.data?.voucherUpdate?.errors?.length > 0) {
                Failure(res?.data?.voucherUpdate?.errors[0]?.message);
            } else {
                const couponId = res?.data?.voucherUpdate?.voucher?.id;

                channelListUpdate(couponId);
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const channelListUpdate = async (id: any) => {
        try {
            const res = await channelUpdate({
                variables: {
                    id,
                    input: {
                        addChannels: [
                            {
                                channelId: 'Q2hhbm5lbDox',
                                discountValue:
                                    state.codeType?.value == 'Free Shipping'
                                        ? '100'
                                        : state.codeType?.value == 'Fixed Amount'
                                        ? Number((Number(state.couponValue) * USDAmt).toFixed(2))
                                        : state.codeType?.value == 'Percentage'
                                        ? state.couponValue
                                        : null,
                                minAmountSpent: state.minimumReq?.value == 'Minimal order value' ? state.minimumReqValue : state.minimumReq?.value == 'None' ? null : 0, // min order value  minimumReq
                                maxAmountSpent: state.maxReq.value == 'None' ? null : state.maxReqValue,
                            },
                            {
                                channelId: 'Q2hhbm5lbDoy',
                                discountValue: state.codeType?.value == 'Free Shipping' ? '100' : Number(state.couponValue),

                                minAmountSpent: state.minimumReq?.value == 'Minimal order value' ? state.minimumReqValue : state.minimumReq?.value == 'None' ? null : 0, // min order value  minimumReq
                                maxAmountSpent: state.maxReq.value == 'None' ? null : state.maxReqValue,
                            },
                        ],
                        removeChannels: [],
                    },
                },
            });
            if (res?.data?.voucherChannelListingUpdate?.errors?.length > 0) {
                Failure(res?.data?.voucherChannelListingUpdate?.errors[0]?.message);
            } else {
                if (state.description !== '') {
                    updateMetaData(id);
                }

                if (state.specificInfo?.value == 'Specific products') {
                    extraDatas(id);
                }
                if (state.specificInfo?.value == 'All products') {
                    setState({ selectedExcludeCategory: [], selectedCategory: [], selectedProduct: [] });
                    router.push(`/coupon`);
                    Success('Coupon updated Successfully');
                }

                if (state.description == '' && state.specificInfo?.value != 'Specific products') {
                    router.push(`/coupon`);
                    Success('Coupon updated Successfully');
                }
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

        const oldExcludeCat = state.oldExcludeCat?.map((val) => val.value) || [];
        const selectedExcludeCategory = state.selectedExcludeCategory?.map((val) => val.value) || [];

        const newlyAddedCat = selectedCategory.filter((item) => !oldCat.includes(item));
        const removedCat = oldCat.filter((item) => !selectedCategory.includes(item));

        const newlyAddedProduct = selectedProduct.filter((item) => !oldProduct.includes(item));
        const removedProduct = oldProduct.filter((item) => !selectedProduct.includes(item));

        const newlyAddedExCat = selectedExcludeCategory.filter((item) => !oldExcludeCat.includes(item));
        const removedExCat = oldExcludeCat.filter((item) => !selectedExcludeCategory.includes(item));

        if (newlyAddedCat?.length > 0 || newlyAddedProduct?.length > 0 || newlyAddedExCat?.length > 0) {
            assignData(id, newlyAddedCat, newlyAddedProduct, newlyAddedExCat);
        }
        if (removedCat?.length > 0 || removedProduct?.length > 0 || removedExCat?.length > 0) {
            removeData(id, removedCat, removedProduct, removedExCat);
        }
        router.push(`/coupon`);
        Success('Coupon updated Successfully');
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

            router.push(`/coupon`);
            Success('Coupon Updated Successfully');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const assignData = async (id: any, categories: any, products: any, exclude_categories: any) => {
        try {
            const res = await assignDataRefetch({
                variables: {
                    first: 20,
                    includeCategories: true,
                    includeCollections: false,
                    includeProducts: false,
                    id,
                    input: {
                        categories,
                        products,
                        exclude_categories,
                    },
                },
            });

            // router.push(`/coupon`);
            // Success('Coupon Updated Successfully');
            setState({ selectedExcludeCategory: [], selectedCategory: [], selectedProduct: [] });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const removeData = async (id: any, categories: any, products: any, exclude_categories: any) => {
        try {
            const res = await removeDataFromCoupon({
                variables: {
                    first: 20,
                    includeCategories: true,
                    includeCollections: false,
                    includeProducts: false,
                    id,
                    input: {
                        categories,
                        products,
                        exclude_categories,
                    },
                },
            });

            // router.push(`/coupon`);
            // Success('Coupon Updated Successfully');
            setState({ selectedExcludeCategory: [], selectedCategory: [], selectedProduct: [] });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const codeType = () => {
        const arr = ['Fixed Amount', 'Percentage', 'Free Shipping'];
        const arr1 = ['None', 'Minimal order value', 'Minimum quantity of items'];
        const arr2 = ['Limit number of times this discount can be used in total', 'Limit to one use per customer', 'Limit to staff only', 'Limit to voucher code use once'];
        const specificInfo = ['All products', 'Specific products'];
        const arr3 = ['None', 'Maximum order value'];
        const type4 = dropdown(arr3);
        const type1 = dropdown(arr1);
        const type = dropdown(arr);
        const type2 = dropdown(arr2);
        const type3 = dropdown(specificInfo);
        setState({ codeOption: type, usageOption: type2, minimumReqOption: type1, specificInfoOption: type3, maxReqOption: type4 });
    };

    // const categoryList = async () => {
    //     const res = await categorySearchRefetch({
    //         after: null,
    //         first: 500,
    //         query: '',
    //     });
    //     const datas = res?.data?.search?.edges?.map((item) => item?.node)?.map((val) => ({ value: val?.id, label: val?.name }));

    //     setState({ catOption: datas });
    // };

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-5">
                <h5 className="text-lg font-semibold dark:text-white-light">Edit Coupon</h5>
            </div>
            <div className="panel mb-5 flex ">
                <div className="flex w-full flex-wrap  items-center ">
                    <div className="w-full md:w-6/12">
                        <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                            Coupon Name
                        </label>
                        <input
                            type="text"
                            value={state.couponName}
                            onChange={(e) => setState({ couponName: e.target.value })}
                            placeholder="Enter Coupon Name"
                            name="name"
                            className="form-input"
                            required
                        />
                        {state.errors?.nameError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.nameError}</p>}
                    </div>

                    {/* <div className="mt-4 flex w-full justify-end md:w-6/12">
                        <Dropdown overlay={menu} trigger={['click']} onVisibleChange={(flag) => setState({ visible: flag })} visible={state.visible}>
                            <Button className="btn btn-primary h-[42px]  w-full md:mb-0 md:w-auto" onClick={(e) => e.preventDefault()}>
                                Create Code <DownOutlined />
                            </Button>
                        </Dropdown>
                    </div> */}
                </div>
            </div>

            <div className="panel   ">
                <div className=" w-full   ">
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                        Coupon Codes
                    </label>
                    <div className="flex w-full ">
                        <div className="">
                            <Dropdown overlay={menu} trigger={['click']} onVisibleChange={(flag) => setState({ visible: flag })} visible={state.visible}>
                                <Button className="btn btn-primary h-[42px]  w-full md:mb-0 md:w-auto" onClick={(e) => e.preventDefault()}>
                                    Create Code <DownOutlined />
                                </Button>
                            </Dropdown>
                            {state.errors?.generatedCodesError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.generatedCodesError}</p>}
                        </div>
                    </div>
                </div>

                {state.generatedCodes?.length > 0 ? (
                    <div className=" mt-5">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={state.generatedCodes}
                            columns={[
                                {
                                    accessor: 'code',
                                    sortable: true,
                                    render: (row, index) => {
                                        return (
                                            <>
                                                <div className="">{row}</div>
                                            </>
                                        );
                                    },
                                },
                                {
                                    accessor: 'status',
                                    sortable: true,
                                    render: (row, index) => {
                                        return (
                                            <>
                                                <div className="">{!state.oldCodes?.includes(row) ? 'Draft' : 'Active'}</div>
                                            </>
                                        );
                                    },
                                },

                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <>
                                            {!state.oldCodes?.includes(row) && (
                                                <div className=" flex w-max  gap-4">
                                                    <button type="button" className="flex hover:text-danger" onClick={() => deleteCode(row)}>
                                                        <IconTrashLines />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={state.generatedCodes.length}
                            recordsPerPage={10}
                            page={null}
                            onPageChange={(p) => {}}
                            sortStatus={{
                                columnAccessor: 'code',
                                direction: 'asc',
                            }}
                            onSortStatusChange={() => {}}
                            withBorder={true}
                            minHeight={100}
                            paginationText={({ from, to, totalRecords }) => ''}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <label htmlFor="name" className=" text-sm font-medium text-gray-700">
                            No coupon codes found
                        </label>
                    </div>
                )}
            </div>

            {/* {state.generatedCodes?.length > 0 && (
                <div className="panel mt-5">
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                        Coupon Codes
                    </label>
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={state.generatedCodes}
                        columns={[
                            {
                                accessor: 'code',
                                sortable: true,
                                render: (row, index) => {
                                    return (
                                        <>
                                            <div className="">{row}</div>
                                        </>
                                    );
                                },
                            },

                            {
                                accessor: 'actions',
                                title: 'Actions',
                                render: (row: any) => (
                                    <>
                                        {!state.oldCodes?.includes(row) && (
                                            <div className=" flex w-max  gap-4">
                                                <button type="button" className="flex hover:text-danger" onClick={() => deleteCode(row)}>
                                                    <IconTrashLines />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={state.generatedCodes.length}
                        recordsPerPage={10}
                        page={null}
                        onPageChange={(p) => {}}
                        sortStatus={{
                            columnAccessor: 'code',
                            direction: 'asc',
                        }}
                        onSortStatusChange={() => {}}
                        withBorder={true}
                        minHeight={100}
                        paginationText={({ from, to, totalRecords }) => ''}
                    />
                </div>
            )} */}
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
                        Coupon Type
                    </label>
                    <Select
                        placeholder="Coupon Type"
                        options={state.codeOption}
                        value={state.codeType}
                        onChange={(e) => {
                            setState({ codeType: e });
                        }}
                        isSearchable={false}
                    />
                </div>

                {state.codeType
                    ? state.codeType?.value != 'Free Shipping' && (
                          <div className="col-6 md:w-6/12">
                              <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                                  Value
                              </label>
                              <div className="flex items-center gap-4">
                                  <input
                                      type="number"
                                      value={state.couponValue}
                                      onChange={(e) => setState({ couponValue: e.target.value })}
                                      placeholder="Enter Coupon value"
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
                      )
                    : null}
            </div>
            {state.codeType?.value != 'Free Shipping' && (
                <div className="panel  mt-5 w-full  gap-5">
                    <div className="col-6 md:w-6/12">
                        <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                            Coupon Specific Information
                        </label>
                        <Select
                            placeholder="Minimum Requirements"
                            options={state.specificInfoOption}
                            value={state.specificInfo}
                            onChange={(e) => {
                                setState({ specificInfo: e });
                            }}
                            isSearchable={false}
                        />
                    </div>
                    {state.specificInfo?.value == 'Specific products' && (
                        <>
                            <div className="mt-5 flex w-full gap-5">
                                <div className="col-6 md:w-6/12">
                                    {/* <ProductSelect
                                        queryFunc={fetchProducts}
                                        selectedCategory={state.selectedProduct}
                                        onCategoryChange={(data) => setState({ selectedProduct: data })}
                                        loading={productLoading}
                                    /> */}

                                    <ProductSelect
                                        loading={productLoading}
                                        queryFunc={fetchProducts}
                                        selectedCategory={state.selectedProduct}
                                        onCategoryChange={(data) => setState({ selectedProduct: data })}
                                    />

                                    {/* 
                                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                                        Products
                                    </label>
                                    <Select
                                        placeholder="Select a product"
                                        options={state.productList}
                                        value={state.selectedProduct}
                                        onChange={(data) => setState({ selectedProduct: data })}
                                        isSearchable={true}
                                        isMulti={true}
                                        isClearable
                                        onInputChange={(inputValue) => setState({ searchProduct: inputValue })}
                                    /> */}
                                </div>
                                <div className="col-6 md:w-6/12">
                                    {/* <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                                        Categories
                                    </label>
                                    <Select
                                        placeholder="Select categories"
                                        options={state.catOption}
                                        value={state.selectedCategory}
                                        onChange={(data: any) => setState({ selectedCategory: data })}
                                        isSearchable={true}
                                        isMulti={true}
                                    /> */}

                                    <CategorySelect
                                        queryFunc={fetchCategories} // Pass the function to fetch categories
                                        selectedCategory={state.selectedCategory} // Use 'selectedCategory' instead of 'value'
                                        onCategoryChange={(data) => setState({ selectedCategory: data })} // Use 'onCategoryChange' instead of 'onChange'
                                        placeholder="Select categories"
                                    />
                                    {/* <CategorySelect
                                        queryFunc={fetchCategories} // Pass the function to fetch categories
                                        value={state.selectedCategory} // Selected categories
                                        onChange={(data: any) => setState({ selectedCategory: data })}
                                        // Handle category change
                                        placeholder="Select categories"
                                    /> */}
                                </div>
                            </div>
                            <div className="col-6 mt-5 md:w-6/12">
                                <CategorySelect
                                    queryFunc={fetchCategories} // Pass the function to fetch categories
                                    selectedCategory={state.selectedExcludeCategory} // Use 'selectedCategory' instead of 'value'
                                    onCategoryChange={(data) => setState({ selectedExcludeCategory: data })} // Use 'onCategoryChange' instead of 'onChange'
                                    placeholder="Select categories"
                                    title="Exclude Categories"
                                />
                                {/* <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                                    Exclude Categories
                                </label>
                                <Select
                                    placeholder="Select categories"
                                    options={state.catOption}
                                    value={state.selectedExcludeCategory}
                                    onChange={(data: any) => setState({ selectedExcludeCategory: data })}
                                    isSearchable={true}
                                    isMulti={true}
                                    title="Exclude Categories"
                                /> */}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="panel mt-5 flex w-full gap-5 ">
                <div className="col-6 md:w-6/12">
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                        Minimum Requirements
                    </label>
                    <Select
                        placeholder="Minimum Requirements"
                        options={state.minimumReqOption}
                        value={state.minimumReq}
                        onChange={(e) => {
                            setState({ minimumReq: e });
                        }}
                        isSearchable={false}
                    />
                </div>
                {state.minimumReq
                    ? state.minimumReq?.value != 'None' && (
                          <div className="col-6 md:w-6/12">
                              <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                                  Value
                              </label>
                              <div className="flex items-center gap-4">
                                  <input
                                      type="number"
                                      value={state.minimumReqValue}
                                      onChange={(e) => setState({ minimumReqValue: e.target.value })}
                                      placeholder={state.minimumReq?.value == 'Minimal order value' ? 'Enter minimal order value' : 'Enter Minimum quantity of items'}
                                      name="name"
                                      className="form-input"
                                      required
                                  />
                              </div>
                              {state.errors?.minimumReqValueError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.minimumReqValueError}</p>}
                          </div>
                      )
                    : null}
            </div>
            <div className="panel flex w-full gap-5 pt-5 ">
                <div className="col-6 md:w-6/12">
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                        Maximum Requirements
                    </label>
                    <Select
                        placeholder="Maximum Requirements"
                        options={state.maxReqOption}
                        value={state.maxReq}
                        onChange={(e) => {
                            setState({ maxReq: e });
                        }}
                        isSearchable={false}
                    />
                </div>
                {state.maxReq
                    ? state.maxReq?.value != 'None' && (
                          <div className="col-6 md:w-6/12">
                              <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                                  Value
                              </label>
                              <div className="flex items-center gap-4">
                                  <input
                                      type="number"
                                      value={state.maxReqValue}
                                      onChange={(e) => setState({ maxReqValue: e.target.value, errors: { maxReqValueError: '' } })}
                                      placeholder="Enter maximum order value"
                                      name="name"
                                      className="form-input"
                                      required
                                  />
                              </div>
                              {state.errors?.maxReqValueError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.maxReqValueError}</p>}
                          </div>
                      )
                    : null}
            </div>

            <div className="panel panel mt-5 flex w-full gap-5">
                <div className="col-6 md:w-6/12">
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                        Usage Limit
                    </label>
                    <Select
                        placeholder="Usage Limit"
                        options={state.usageOption}
                        value={state.usageLimit}
                        onChange={(e) => {
                            setState({ usageLimit: e });
                        }}
                        isSearchable={false}
                    />
                </div>
                {state.usageLimit
                    ? state.usageLimit?.value == 'Limit number of times this discount can be used in total' && (
                          <div className="col-6 md:w-6/12">
                              <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                                  Value
                              </label>
                              <div className="flex items-center gap-4">
                                  <input
                                      type="number"
                                      value={state.usageValue}
                                      onChange={(e) => setState({ usageValue: e.target.value })}
                                      placeholder="Limit of Uses"
                                      name="name"
                                      className="form-input"
                                      required
                                  />
                              </div>
                              {state.errors?.usageValueError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.usageValueError}</p>}
                          </div>
                      )
                    : null}
            </div>
            <div className="panel  gap-5">
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
                    <div className=" flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={state.invidual}
                            onChange={(e) => setState({ invidual: e.target.checked })}
                            className="form-checkbox border-white-light dark:border-white-dark ltr:mr-0 rtl:ml-0"
                        />
                        <h3 className="text-md cursor-pointer font-semibold dark:text-white-light" onClick={() => setState({ invidual: !state.invidual })}>
                            Invidual use only
                        </h3>
                    </div>
                    <div className=" flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={state.autoApply}
                            onChange={(e) => setState({ autoApply: e.target.checked })}
                            className="form-checkbox border-white-light dark:border-white-dark ltr:mr-0 rtl:ml-0"
                        />
                        <h3 className="text-md cursor-pointer font-semibold dark:text-white-light" onClick={() => setState({ autoApply: !state.autoApply })}>
                            Site Wide
                        </h3>
                    </div>
                    <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => updateCoupon()}>
                        {loading || chennelLoading || assignLoading || removeLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                    </button>
                    <button type="button" className="btn btn-danger  w-full md:mb-0 md:w-auto" onClick={() => router.push('/coupon')}>
                        {'Cancel'}
                    </button>
                </div>
            </div>

            <Modal
                addHeader={'Enter Coupon Code'}
                open={state.isOpen}
                close={() => setState({ isOpen: false })}
                renderComponent={() => (
                    <div className=" p-5">
                        <input
                            type="text"
                            value={state.couponName}
                            onChange={(e) => setState({ couponName: e.target.value })}
                            placeholder="Enter Coupon Code"
                            name="name"
                            className="form-input"
                            required
                        />
                        {state.couponNameErr && <p className="error-message mt-1 text-red-500">{state.couponNameErr}</p>}

                        <div className="flex items-center justify-end gap-5 pt-5">
                            <button type="button" className="btn btn-outline-primary  w-full md:mb-0 md:w-auto" onClick={() => setState({ isOpen: false })}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => addManualCode()}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}
            />

            <Modal
                addHeader={'Generate Coupon Code'}
                open={state.autoCode}
                close={() => setState({ autoCode: false })}
                renderComponent={() => (
                    <div className=" p-5">
                        <input
                            type="number"
                            value={state.autoCodeNumber}
                            onChange={(e) => setState({ autoCodeNumber: e.target.value })}
                            placeholder="Code Quantity (max 50)"
                            name="name"
                            className="form-input"
                            required
                        />
                        {state.autoCodeNumberErr && <p className="error-message mt-1 text-red-500">{state.autoCodeNumberErr}</p>}

                        <div className="flex items-center justify-end gap-5 pt-5">
                            <button type="button" className="btn btn-outline-primary  w-full md:mb-0 md:w-auto" onClick={() => setState({ autoCode: false })}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => addGenerateCode()}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}
            />
        </>
    );
};

export default PrivateRouter(EditCoupon);
