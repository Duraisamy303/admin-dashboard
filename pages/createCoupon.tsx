import { DateToStringFormat, Failure, Success, USDAmt, dropdown, generateRandomCode, useSetState } from '@/utils/functions';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Modal from '@/components/Modal';
import { DataTable, DataTableProps } from 'mantine-datatable';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import Select from 'react-select';
import { useMutation } from '@apollo/client';
import { COUPON_CHANNEL_UPDATE, COUPON_META_DATA, CREATE_COUPEN } from '@/query/product';
import { Description } from '@headlessui/react/dist/components/description/description';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import IconLoader from '@/components/Icon/IconLoader';

const CreateCoupon = () => {
    const router = useRouter();

    const [createCoupons, { loading: createLoading }] = useMutation(CREATE_COUPEN);
    const [channelUpdate, { loading: chennelLoading }] = useMutation(COUPON_CHANNEL_UPDATE);

    const [metaData, { loading: metaLoading }] = useMutation(COUPON_META_DATA);

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
        usageLimit: { value: 'Limit number of times this discount can be used in total', label: 'Limit number of times this discount can be used in total' },
        minimumReq: { value: 'None', label: 'None' },
        maxReq: { value: 'None', label: 'None' },
        maxReqOption: [],
        maxReqValueError: '',
        maxReqValue: '',
        minimumReqValue: '',
        usageValue: '',
        isEndDate: false,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: '',
        description: '',
        codeType: { value: 'Fixed Amount', label: 'Fixed Amount' },
        manualCode: '',
        manualCodeErr: '',
        errors: null,
        autoApply: false,
        invidual: false,
    });

    useEffect(() => {
        codeType();
    }, []);

    const handleMenuClick = (e) => {
        setState({ visible: false, typeOfCode: e.key });
        if (e.key === 'manual') {
            setState({ isOpen: true, couponNameErr: '' });
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
        if (state.manualCode == '') {
            setState({ manualCodeErr: 'Please enter coupon code' });
        } else {
            setState({ isOpen: false, manualCodeErr: '', manualCode: '', generatedCodes: [...state.generatedCodes, state.manualCode], errors: { generatedCodesError: '' } });
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
                errors: { generatedCodesError: '' },
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
            errors: { endDateError: '' },
        });
    };

    const CreateCoupon = async () => {
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

            const body = {
                name: couponName,
                applyOncePerCustomer: usageLimit.value === 'Limit to one use per customer',
                applyOncePerOrder: false,
                onlyForStaff: usageLimit.value === 'Limit to staff only',
                addCodes: generatedCodes,
                discountValueType: codeType.value === 'Fixed Amount' ? 'FIXED' : 'PERCENTAGE',
                endDate: isEndDate ? endDate : null,
                minCheckoutItemsQuantity: minimumReq.value === 'Minimum quantity of items' ? minimumReqValue : 0,
                startDate: startDate,
                type: codeType.value === 'Free Shipping' ? 'SHIPPING' : 'ENTIRE_ORDER',
                usageLimit: usageLimit.value === 'Limit number of times this discount can be used in total' ? (usageValue ? usageValue : null) : null,
                singleUse: usageLimit.value === 'Limit to voucher code use once',
                autoApply: state.autoApply,
                invidualUseOnly: state.invidual,
            };

            const res = await createCoupons({
                variables: {
                    input: body,
                },
            });

            if (res?.data?.voucherCreate?.errors?.length > 0) {
                Failure(res.data.voucherCreate.errors[0].message);
            } else {
                const couponId = res.data.voucherCreate.voucher.id;
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
                } else {
                    router.push(`/editCoupon?id=${id}`);
                    Success('Coupon Created Successfully');
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
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

            router.push(`/editCoupon?id=${id}`);
            Success('Coupon Created Successfully');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const codeType = () => {
        const arr = ['Fixed Amount', 'Percentage', 'Free Shipping'];
        const arr1 = ['None', 'Minimal order value', 'Minimum quantity of items'];
        const arr3 = ['None', 'Maximum order value'];
        const arr2 = ['Limit number of times this discount can be used in total', 'Limit to one use per customer', 'Limit to staff only', 'Limit to voucher code use once'];
        const type1 = dropdown(arr1);
        const type = dropdown(arr);
        const type2 = dropdown(arr2);
        const type3 = dropdown(arr3);

        setState({ codeOption: type, usageOption: type2, minimumReqOption: type1, maxReqOption: type3 });
    };

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-5">
                <h5 className="text-lg font-semibold dark:text-white-light">Create Coupon</h5>
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
                            onChange={(e) => setState({ couponName: e.target.value, errors: { nameError: '' } })}
                            placeholder="Enter Coupon Name"
                            name="name"
                            className="form-input"
                            required
                        />
                        {state.errors?.nameError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.nameError}</p>}
                    </div>
                    {/* <div className="mt-4 flex w-full justify-end md:w-6/12">
                        <div className="">
                            <Dropdown overlay={menu} trigger={['click']} onVisibleChange={(flag) => setState({ visible: flag })} visible={state.visible}>
                                <Button className="btn btn-primary h-[42px]  w-full md:mb-0 md:w-auto" onClick={(e) => e.preventDefault()}>
                                    Create Code <DownOutlined />
                                </Button>
                            </Dropdown>
                            {state.errors?.generatedCodesError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.generatedCodesError}</p>}
                        </div>
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
                                                <div className="">{'Draft'}</div>
                                            </>
                                        );
                                    },
                                },

                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <>
                                            <div className=" flex w-max  gap-4">
                                                <button type="button" className="flex hover:text-danger" onClick={() => deleteCode(row)}>
                                                    <IconTrashLines />
                                                </button>
                                            </div>
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
                                      onChange={(e) => setState({ couponValue: e.target.value, errors: { couponValueError: '' } })}
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

            <div className="panel flex w-full gap-5 pt-5 ">
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
                                      onChange={(e) => setState({ minimumReqValue: e.target.value, errors: { minimumReqValueError: '' } })}
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

            <div className="panel panel flex w-full gap-5 pt-5">
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
                                      onChange={(e) => setState({ usageValue: e.target.value, errors: { usageValueError: '' } })}
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
            <div className="panel">
                <div className=" flex w-full gap-5 pt-5">
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
                            </>
                        )}
                        {state.errors?.endDateError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.endDateError}</p>}
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
                    <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => CreateCoupon()}>
                        {createLoading || chennelLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
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
                            value={state.manualCode}
                            onChange={(e) => setState({ manualCode: e.target.value })}
                            placeholder="Enter Coupon Code"
                            name="name"
                            className="form-input"
                            required
                        />
                        {state.manualCodeErr && <p className="error-message mt-1 text-red-500">{state.manualCodeErr}</p>}

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

export default PrivateRouter(CreateCoupon);
