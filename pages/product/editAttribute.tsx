import IconTrashLines from '@/components/Icon/IconTrashLines';
import { Failure, Success, useSetState } from '@/utils/functions';
import { DataTable } from 'mantine-datatable';
import React, { useEffect } from 'react';
import Select from 'react-select';
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Modal from '@/components/Modal';
import IconLoader from '@/components/Icon/IconLoader';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { ATTRIBUTE_DETAILS, CREATE_ATTRIBUTE, CREATE_ATTRIBUTE_VALUE, DELETE_ATTRIBUTE_VALUE, UPDATE_ATTRIBUTE } from '@/query/product';
import CommonLoader from '../elements/commonLoader';

export default function createAttribute() {
    const router = useRouter();

    const id = router?.query?.id;

    const [state, setState] = useSetState({
        attributeName: '',
        nameError: '',
        isOpen: false,
        manualCodeErr: '',
        manualCode: '',
        values: [],
        visibleInStorefront: false,
        deleteRowId: '',
        slug: '',
        slugError: '',
    });

    const [updateAttributes, { loading: createLoading }] = useMutation(UPDATE_ATTRIBUTE);

    const [createAttributeValue, { loading: createValueLoading }] = useMutation(CREATE_ATTRIBUTE_VALUE);
    const [deleteAttributeValue, { loading: deleteValueLoading }] = useMutation(DELETE_ATTRIBUTE_VALUE);

    const { data: attributeDetails, refetch: attributeRefetch, loading: isLoading } = useQuery(ATTRIBUTE_DETAILS);

    useEffect(() => {
        getDetails();
    }, [id]);

    const getDetails = async () => {
        try {
            const res = await attributeRefetch({
                id,
                firstValues: 10,
                PERMISSION_HANDLE_CHECKOUTS: true,
                PERMISSION_HANDLE_PAYMENTS: true,
                PERMISSION_HANDLE_TAXES: true,
                PERMISSION_IMPERSONATE_USER: true,
                PERMISSION_MANAGE_APPS: true,
                PERMISSION_MANAGE_CHANNELS: true,
                PERMISSION_MANAGE_CHECKOUTS: true,
                PERMISSION_MANAGE_DISCOUNTS: true,
                PERMISSION_MANAGE_GIFT_CARD: true,
                PERMISSION_MANAGE_MENUS: true,
                PERMISSION_MANAGE_OBSERVABILITY: true,
                PERMISSION_MANAGE_ORDERS: true,
                PERMISSION_MANAGE_ORDERS_IMPORT: true,
                PERMISSION_MANAGE_PAGES: true,
                PERMISSION_MANAGE_PAGE_TYPES_AND_ATTRIBUTES: true,
                PERMISSION_MANAGE_PLUGINS: true,
                PERMISSION_MANAGE_PRODUCTS: true,
                PERMISSION_MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES: true,
                PERMISSION_MANAGE_SETTINGS: true,
                PERMISSION_MANAGE_SHIPPING: true,
                PERMISSION_MANAGE_STAFF: true,
                PERMISSION_MANAGE_TAXES: true,
                PERMISSION_MANAGE_TRANSLATIONS: true,
                PERMISSION_MANAGE_USERS: true,
            });
            const data = res?.data?.attribute;
            const choice = data.choices?.edges;
            let value = [];
            if (choice?.length > 0) {
                value = choice?.map((item) => ({ id: item.node?.id, name: item.node.name }));
            }

            setState({ attributeName: data.name, values: value, visibleInStorefront: data.visibleInStorefront, slug: data.slug });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const deleteCode = async (row) => {
        setState({ deleteRowId: row.id });
        const res = await deleteAttributeValue({
            variables: {
                id: row.id,
                firstValues: 10,
            },
        });
        if (res?.data?.attributeValueDelete?.errors?.length > 0) {
            Failure(res.data?.attributeValueDelete?.errors[0]?.message);
        } else {
            Success('Attribute value deleted successfully');
            getDetails();
        }
    };

    const createValue = async () => {
        try {
            if (state.manualCode == '') {
                setState({ manualCodeErr: 'Name is required' });
            } else {
                const body = {
                    name: state.manualCode,
                };

                const res = await createAttributeValue({
                    variables: {
                        id,
                        input: body,
                        firstValues: 10,
                    },
                });

                if (res?.data?.attributeValueCreate?.errors?.length > 0) {
                    Failure(res.data.attributeValueCreate.errors[0].message);
                } else {
                    Success('Attribute value created successfully');
                    getDetails();
                    setState({ isOpen: false, manualCode: '', manualCodeErr: '' });
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateAttribute = async () => {
        if (state.attributeName == '') {
            setState({ nameError: 'Attribute name is required' });
        } else if (state.slug == '') {
            setState({ slugError: 'Slug is required' });
        } else {
            const res = await updateAttributes({
                variables: {
                    id: id,
                    input: {
                        availableInGrid: true,
                        filterableInDashboard: true,
                        filterableInStorefront: true,
                        name: state.attributeName,
                        slug: state.slug.trim(),
                        storefrontSearchPosition: 0,
                        valueRequired: false,
                        visibleInStorefront: state.visibleInStorefront,
                        unit: null,
                    },
                },
            });
            if (res.data?.attributeUpdate?.errors?.length > 0) {
                Failure(res.data?.attributeUpdate?.errors[0].message);
            } else {
                Success('Attribute updated successfully');
                getDetails();
                setState({ nameError: '', slugError: '' });
            }
        }
    };

    return isLoading ? (
        <CommonLoader />
    ) : (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-5">
                <h5 className="text-lg font-semibold dark:text-white-light">Update Attribute</h5>
            </div>
            <div className="panel mb-5 w-full">
                <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                    Attribute Name
                </label>
                <input
                    type="text"
                    value={state.attributeName}
                    onChange={(e) => setState({ attributeName: e.target.value, errors: { nameError: '' } })}
                    placeholder="Enter Attribute Name"
                    name="name"
                    className="form-input"
                    required
                />
                {state?.nameError && <p className="mt-[4px] text-[14px] text-red-600">{state?.nameError}</p>}

                <div className="mt-5">
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                        Slug
                    </label>
                    <input
                        type="text"
                        value={state.slug}
                        onChange={(e) => setState({ slug: e.target.value, errors: { slugError: '' } })}
                        placeholder="Enter Slug"
                        name="name"
                        className="form-input"
                        required
                    />
                    {state?.slugError && <p className="mt-[4px] text-[14px] text-red-600">{state?.slugError}</p>}
                </div>
            </div>
            <div className=" w-full flex-wrap  items-center">
                <div className="panel ">
                    <div className=" flex w-full justify-between ">
                        <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                            Values
                        </label>
                        <div className="">
                            <Button className="btn btn-primary h-[42px]  w-full md:mb-0 md:w-auto" onClick={() => setState({ isOpen: true })}>
                                Add New
                            </Button>
                        </div>
                    </div>

                    {state.values?.length > 0 ? (
                        <div className=" mt-5">
                            <DataTable
                                className="table-hover whitespace-nowrap"
                                records={state.values}
                                columns={[
                                    {
                                        accessor: 'Name',
                                        render: (row, index) => {
                                            return (
                                                <>
                                                    <div className="">{row?.name}</div>
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
                                                        {deleteValueLoading && row?.id == state.deleteRowId ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : <IconTrashLines />}
                                                    </button>
                                                </div>
                                            </>
                                        ),
                                    },
                                ]}
                                highlightOnHover
                                totalRecords={state.values.length}
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
                                No Values Found
                            </label>
                        </div>
                    )}
                </div>
            </div>
            <div className="panel mb-3 flex items-center justify-end gap-3">
                <div className=" flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={state.visibleInStorefront}
                        onChange={(e) => setState({ visibleInStorefront: e.target.checked })}
                        className="form-checkbox border-white-light dark:border-white-dark ltr:mr-0 rtl:ml-0"
                    />
                    <h3 className="text-md cursor-pointer font-semibold dark:text-white-light" onClick={() => setState({ visibleInStorefront: !state.visibleInStorefront })}>
                        Visible In StoreFront
                    </h3>
                </div>
                <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => updateAttribute()}>
                    {createLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                </button>
                <button type="button" className="btn btn-danger  w-full md:mb-0 md:w-auto" onClick={() => router.push('/product/attributes')}>
                    {'Cancel'}
                </button>
            </div>
            <Modal
                addHeader={'Add Value '}
                open={state.isOpen}
                close={() => setState({ isOpen: false, manualCode: '', manualCodeErr: '' })}
                renderComponent={() => (
                    <div className=" p-5">
                        <input
                            type="text"
                            value={state.manualCode}
                            onChange={(e) => setState({ manualCode: e.target.value })}
                            placeholder="Enter Name"
                            name="name"
                            className="form-input"
                            required
                        />
                        {state.manualCodeErr && <p className="error-message mt-1 text-red-500">{state.manualCodeErr}</p>}

                        <div className="flex items-center justify-end gap-5 pt-5">
                            <button type="button" className="btn btn-outline-primary  w-full md:mb-0 md:w-auto" onClick={() => setState({ isOpen: false, manualCode: '', manualCodeErr: '' })}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => createValue()}>
                                {createValueLoading ? <IconLoader /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </>
    );
}
