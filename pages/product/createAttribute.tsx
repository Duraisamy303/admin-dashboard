import IconTrashLines from '@/components/Icon/IconTrashLines';
import { Failure, Success, useSetState } from '@/utils/functions';
import { DataTable } from 'mantine-datatable';
import React from 'react';
import Select from 'react-select';
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Modal from '@/components/Modal';
import IconLoader from '@/components/Icon/IconLoader';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { CREATE_ATTRIBUTE } from '@/query/product';
import PrivateRouter from '@/components/Layouts/PrivateRouter';

const createAttribute = () => {
    const router = useRouter();

    const [state, setState] = useSetState({
        attributeName: '',
        nameError: '',
        isOpen: false,
        manualCodeErr: '',
        manualCode: '',
        values: [],
        visibleInStorefront: false,
    });

    const [createAttribute, { loading: createLoading }] = useMutation(CREATE_ATTRIBUTE);

    const deleteCode = (row) => {
        const filter = state.values?.filter((item) => item !== row);
        setState({ values: filter });
    };

    const addManualCode = () => {
        if (state.manualCode == '') {
            setState({ manualCodeErr: 'Please enter name' });
        } else {
            setState({ isOpen: false, manualCodeErr: '', manualCode: '', values: [...state.values, state.manualCode] });
        }
    };

    const create = async () => {
        try {
            let value = [];
            if (state.values?.length > 0) {
                value = state.values?.map((item) => ({ name: item }));
            }
            const body = {
                availableInGrid: true,
                entityType: null,
                filterableInDashboard: true,
                filterableInStorefront: true,
                inputType: 'MULTISELECT',
                name: state.attributeName,
                slug: state.attributeName.trim(),
                storefrontSearchPosition: null,
                type: 'PRODUCT_TYPE',
                valueRequired: false,
                visibleInStorefront: state.visibleInStorefront,
                values: value,
            };

            const res = await createAttribute({
                variables: {
                    input: body,
                },
            });
            console.log('res: ', res);

            if (res?.data?.attributeCreate?.errors?.length > 0) {
                Failure(res.data.attributeCreate.errors[0].message);
            } else {
                router.push('/product/attributes');
                Success('Attribute created successfully');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-5">
                <h5 className="text-lg font-semibold dark:text-white-light">Create Attribute</h5>
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
                {state.errors?.nameError && <p className="mt-[4px] text-[14px] text-red-600">{state.errors?.nameError}</p>}
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
                    <h3 className="text-md font-semibold dark:text-white-light">Visible In StoreFront</h3>
                </div>
                <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => create()}>
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
                            placeholder="Enter Value Name"
                            name="name"
                            className="form-input"
                            required
                        />
                        {state.manualCodeErr && <p className="error-message mt-1 text-red-500">{state.manualCodeErr}</p>}

                        <div className="flex items-center justify-end gap-5 pt-5">
                            <button type="button" className="btn btn-outline-primary  w-full md:mb-0 md:w-auto" onClick={() => setState({ isOpen: false, manualCode: '', manualCodeErr: '' })}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => addManualCode()}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}
            />
        </>
    );
};
export default PrivateRouter(createAttribute);
