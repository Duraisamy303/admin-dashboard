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
import { COUPON_CHANNEL_UPDATE, COUPON_META_DATA, CREATE_COUPEN, CREATE_DISCOUNT, UPDATE_DISCOUNT_CHANNEL, UPDATE_DISCOUNT_METADATA } from '@/query/product';
import { Description } from '@headlessui/react/dist/components/description/description';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import IconLoader from '@/components/Icon/IconLoader';

const CreateDiscount = () => {
    const router = useRouter();

    const [createDiscounts, { loading: createLoading }] = useMutation(CREATE_DISCOUNT);
    const [channelUpdate, { loading: chennelLoading }] = useMutation(UPDATE_DISCOUNT_CHANNEL);

    const [metaData, { loading: metaLoading }] = useMutation(UPDATE_DISCOUNT_METADATA);

    const [state, setState] = useSetState({
        couponName: '',
        nameError: '',
        visible: false,
        couponNameErr: '',
        codeOption: [],
        couponValue: '',
        isEndDate: false,
        startDate: null,
        endDate: null,
        description: '',
        codeType: { value: 'Fixed Amount', label: 'Fixed Amount' },

        errors: null,
    });

    useEffect(() => {
        codeType();
    }, []);


    const handleStartDateChange = (e) => {
        setState({
            startDate: e.target.value,
            endDate: null, // Clear endDate when startDate changes
        });
    };

    const handleEndDateChange = (e) => {
        setState({
            endDate: e.target.value,
            errors: { endDateError: '' },
        });
    };

    const createDiscount = async () => {
        try {
            let errors: any = {};

            const { couponName, codeType, couponValue, isEndDate, endDate, startDate } = state;

            if (!couponName) {
                errors.nameError = 'Discount name is required';
            }

            if (couponValue == '') {
                errors.couponValueError = 'Discount value is required';
            }

            if (isEndDate && !endDate) {
                errors.endDateError = 'End date is required';
            }

            if (Object.keys(errors).length > 0) {
                setState({ errors });
                return;
            }
            const res = await createDiscounts({
                variables: {
                    input: {
                        name: couponName,
                        endDate: state.isEndDate ? new Date(state.endDate).toISOString() : null,
                        startDate: state.startDate ? new Date(state.startDate).toISOString() : null,
                        type: codeType.value === 'Fixed Amount' ? 'FIXED' : 'PERCENTAGE',
                        value: null,
                    },
                },
            });
            console.log('res: ', res);

            if (res?.data?.saleCreate?.errors?.length > 0) {
                Failure(res.data.saleCreate.errors[0].message);
            } else {
                const discountId = res.data.saleCreate.sale.id;
                channelListUpdate(discountId);
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
                if (state.description !== '') {
                    updateMetaData(id);
                } else {
                    router.push(`/updateDiscount?id=${id}`);
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

            router.push(`/updateDiscount?id=${id}`);
            Success('Discount Created Successfully');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const codeType = () => {
        const arr = ['Fixed Amount', 'Percentage'];
        const type = dropdown(arr);
        setState({ codeOption: type });
    };

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-5">
                <h5 className="text-lg font-semibold dark:text-white-light">Create Discount</h5>
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
                            onChange={(e) => setState({ couponName: e.target.value, errors: { nameError: '' } })}
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
            </div>
            <div className="mt-5 flex items-center justify-end gap-4">
                <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => createDiscount()}>
                    {createLoading || chennelLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                </button>
                <button type="button" className="btn btn-danger  w-full md:mb-0 md:w-auto" onClick={() => router.push('/coupon')}>
                    {'Cancel'}
                </button>
            </div>
        </>
    );
};

export default PrivateRouter(CreateDiscount);
