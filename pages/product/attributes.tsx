import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconPencil from '@/components/Icon/IconPencil';
import { Loader } from '@mantine/core';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '@/components/Icon/IconCaretDown';

import Swal from 'sweetalert2';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { ATTRIBUTE_LIST, CREATE_ATTRIBUTE, DELETE_ATTRIBUTE, DELETE_CATEGORY } from '@/query/product';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import { useRouter } from 'next/router';
import CommonLoader from '../elements/commonLoader';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import Modal from '@/components/Modal';
import { Failure, Success } from '@/utils/functions';
import IconLoader from '@/components/Icon/IconLoader';

const Category = () => {
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const PAGE_SIZE = 20;

    const router = useRouter();

    const dispatch = useDispatch();

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [deleteAttribute] = useMutation(DELETE_ATTRIBUTE);

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [search, setSearch] = useState('');
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const [attributeName, setAttributeName] = useState('');
    const [attributeNameError, setAttributeNameError] = useState('');
    const [slug, setSlug] = useState('');
    const [slugError, setSlugError] = useState('');

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        dispatch(setPageTitle('Category'));
    });

    const {
        data: customerData,
        loading: getLoading,
        refetch: categoryListRefetch,
    } = useQuery(ATTRIBUTE_LIST, {
        variables: {
            first: PAGE_SIZE,
            after: null,
            filter: {
                search: search ? search : '',
            },
            sort: { direction: 'DESC', field: 'CREATED_aT' },
        },
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const {} = useQuery(ATTRIBUTE_LIST, {
        variables: {
            first: PAGE_SIZE,
            after: null,
            filter: {
                search: '',
            },
            sort: { direction: 'DESC', field: 'CREATED_aT' },
        },
        onCompleted: (data) => {
            setTotalCount(data?.attributes?.totalCount);
        },
    });

    const { data, refetch: refetch } = useQuery(ATTRIBUTE_LIST);

    const [createAttribute, { loading: createLoading }] = useMutation(CREATE_ATTRIBUTE);

    const [fetchNextPage] = useLazyQuery(ATTRIBUTE_LIST, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(ATTRIBUTE_LIST, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const commonPagination = (data) => {
        const customers = data?.attributes?.edges;
        const pageInfo = data?.attributes?.pageInfo;

        const newData = customers?.map((item: any) => {
            return {
                ...item.node,
                name: item.node.name,
            };
        });
        setRecordsData(newData);
        setStartCursor(pageInfo?.startCursor || null);
        setEndCursor(pageInfo?.endCursor || null);
        setHasNextPage(pageInfo?.hasNextPage || false);
        setHasPreviousPage(pageInfo?.hasPreviousPage || false);
    };

    const handleNextPage = () => {
        fetchNextPage({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: endCursor,
                before: null,
                filter: {
                    search: search ? search : '',
                },
                sort: { direction: 'DESC', field: 'CREATED_aT' },
            },
        });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                channel: 'india-channel',
                last: PAGE_SIZE,
                before: startCursor,
                filter: {
                    search: search ? search : '',
                },
                sort: { direction: 'DESC', field: 'CREATED_aT' },
            },
        });
    };
    // Statement Earrings necklaces
    const refresh = async () => {
        try {
            const { data } = await refetch({
                first: PAGE_SIZE,
                after: null,
                filter: {
                    search: '',
                },
            });
            commonPagination(data);
        } catch (error) {
            console.log('error: ', error);
        }
    };
    const handleSearchChange = async (e) => {
        setSearch(e);
        if (e == '') {
            refresh();
        } else {
            const res = await categoryListRefetch({
                variables: {
                    channel: 'india-channel',
                    search: e,
                    last: PAGE_SIZE,
                    before: startCursor,
                    filter: {
                        search: e,
                    },
                    sort: { direction: 'DESC', field: 'CREATED_aT' },
                },
            });
            commonPagination(res?.data);
        }
    };

    // delete Alert Message
    const showDeleteAlert = (onConfirm: () => void, onCancel: () => void) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary',
                cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
                popup: 'sweet-alerts',
            },
            buttonsStyling: false,
        });

        swalWithBootstrapButtons
            .fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
                reverseButtons: true,
                padding: '2em',
            })
            .then((result) => {
                if (result.isConfirmed) {
                    onConfirm(); // Call the onConfirm function if the user confirms the deletion
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    onCancel(); // Call the onCancel function if the user cancels the deletion
                }
            });
    };

    const DeleteCategory = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data } = await deleteAttribute({ variables: { id: record.id } });
                if (data?.attributeDelete?.errors?.length > 0) {
                    Failure(data?.attributeDelete?.errors[0]?.message);
                } else {
                    const updatedRecordsData = recordsData.filter((dataRecord: any) => dataRecord.id !== record.id);
                    setRecordsData(updatedRecordsData);
                    setTotalCount(totalCount - 1);
                }

                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    const create = async () => {
        try {
            if (attributeName == '') {
                setAttributeNameError('Attribute Name is required');
            } else if (slug == '') {
                setSlugError('Slug is required');
            } else {
                const body = {
                    availableInGrid: true,
                    entityType: null,
                    filterableInDashboard: true,
                    filterableInStorefront: true,
                    inputType: 'MULTISELECT',
                    name: attributeName,
                    slug: slug.trim(),
                    storefrontSearchPosition: null,
                    type: 'PRODUCT_TYPE',
                    valueRequired: false,
                    visibleInStorefront: false,
                    values: [],
                };

                const res = await createAttribute({
                    variables: {
                        input: body,
                    },
                });

                if (res?.data?.attributeCreate?.errors?.length > 0) {
                    Failure(res.data.attributeCreate.errors[0].message);
                } else {
                    refresh();
                    Success('Attribute created successfully');
                    setIsOpenCreate(false);
                    setAttributeName('');
                    setSlug('');
                    setSlugError('');
                    setAttributeNameError('');
                    setTotalCount(totalCount + 1);
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex-col gap-5 md:flex md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Attributes ({totalCount})</h5>

                    <div className="mt-5 md:mt-0 md:flex  md:ltr:ml-auto md:rtl:mr-auto">
                        <input type="text" className="form-input mb-3 mr-2 w-full md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />

                        {/* <button type="button" className="btn btn-primary w-full md:mb-0 md:w-auto" onClick={() => window.open('/product/createAttribute')}> */}
                        <button type="button" className="btn btn-primary w-full md:mb-0 md:w-auto" onClick={() => setIsOpenCreate(true)}>
                            + Create
                        </button>
                    </div>
                </div>
                {getLoading ? (
                    <CommonLoader />
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                { accessor: 'name', sortable: true },

                                {
                                    // Custom column for actions
                                    accessor: 'actions', // You can use any accessor name you want
                                    title: 'Actions',
                                    // Render method for custom column
                                    render: (row: any) => (
                                        <>
                                            {/* <Tippy content="View">
                                            <button type="button" onClick={() => ViewCategory(row)}>
                                                <IconEye className="ltr:mr-2 rtl:ml-2" />
                                            </button>
                                        </Tippy> */}
                                            <Tippy content="Edit">
                                                <button type="button" onClick={() => window.open(`/product/editAttribute?id=${row.id}`, '_blank')}>
                                                    <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Delete">
                                                <button type="button" onClick={() => DeleteCategory(row)}>
                                                    <IconTrashLines />
                                                </button>
                                            </Tippy>
                                        </>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={recordsData?.length}
                            recordsPerPage={PAGE_SIZE}
                            minHeight={200}
                            page={null}
                            onPageChange={(p) => {}}
                            withBorder={true}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                        />
                    </div>
                )}
                <div className="mt-5 flex justify-end gap-3">
                    <button disabled={!hasPreviousPage} onClick={handlePreviousPage} className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                        <IconArrowBackward />
                    </button>
                    <button disabled={!hasNextPage} onClick={handleNextPage} className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                        <IconArrowForward />
                    </button>
                </div>
            </div>
            <Modal
                addHeader={'Add Attribute '}
                open={isOpenCreate}
                close={() => {
                    setIsOpenCreate(false);
                    setAttributeName('');
                    setAttributeNameError('');
                    setSlugError('');
                    setAttributeNameError('');
                }}
                renderComponent={() => (
                    <div className=" p-5 ">
                        <input type="text" value={attributeName} onChange={(e) => setAttributeName(e.target.value)} placeholder="Enter Attribute Name" name="name" className="form-input" required />
                        {attributeNameError && <p className="error-message mt-1 text-red-500">{attributeNameError}</p>}
                        <div className="mt-5">
                            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Enter Slug" name="name" className="form-input" required />
                            {slugError && <p className="error-message mt-1 text-red-500">{slugError}</p>}
                        </div>
                        <div className="flex items-center justify-end gap-5 pt-5">
                            <button
                                type="button"
                                className="btn btn-outline-primary  w-full md:mb-0 md:w-auto"
                                onClick={() => {
                                    setIsOpenCreate(false);
                                    setAttributeName('');
                                    setAttributeNameError('');
                                    setSlugError('');
                                    setAttributeNameError('');
                                }}
                            >
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => create()}>
                                {createLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default PrivateRouter(Category);
