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
import { CATEGORY_LIST, DELETE_CATEGORY } from '@/query/product';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import { useRouter } from 'next/router';
import CommonLoader from '../elements/commonLoader';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';

const Category = () => {
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const PAGE_SIZE = 10;

    const router = useRouter();

    const dispatch = useDispatch();

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [deleteCategory] = useMutation(DELETE_CATEGORY);
    const [bulkDelete] = useMutation(DELETE_CATEGORY);

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [search, setSearch] = useState('');
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
    } = useQuery(CATEGORY_LIST, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
            search: search !== '' ? search : '',
        },
        onCompleted: (data) => {
            console.log('data: ', data);
            commonPagination(data);
        },
    });


    const {
       
    } = useQuery(CATEGORY_LIST, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
            search:  '',
        },
        onCompleted: (data) => {
            setTotalCount(data?.categories?.totalCount);
        },
    });

    const { data, refetch: refetch } = useQuery(CATEGORY_LIST);

    const [fetchNextPage] = useLazyQuery(CATEGORY_LIST, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(CATEGORY_LIST, {
        onCompleted: (data) => {
            commonPagination(data);
        },
    });

    const commonPagination = (data) => {
        const customers = data?.categories?.edges;
        const pageInfo = data?.categories?.pageInfo;

        const newData = customers?.map((item: any) => {
            const jsonObject = JSON.parse(item?.node?.description || item?.node?.description);
            // Extract the text value
            const textValue = jsonObject?.blocks[0]?.data?.text;
            return {
                ...item.node,
                parent: item.node.parent?.name || '',
                parentId: item.node.parent?.id,
                product: item.node.products?.totalCount,
                textdescription: textValue || '',
                menuOrder: item.node?.menuOrder,
                image: item.node?.backgroundImageUrl, // Set textValue or empty string if it doesn't exist
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
            },
        });
    };

    const handlePreviousPage = () => {
        fetchPreviousPage({
            variables: {
                channel: 'india-channel',
                last: PAGE_SIZE,
                before: startCursor,
            },
        });
    };
    // Statement Earrings necklaces
    const refresh = async () => {
        try {
            const { data } = await refetch({
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: null,
                search: '',
            });
            commonPagination(data);
        } catch (error) {
            console.log('error: ', error);
        }
    };
    const handleSearchChange = async (e) => {
        console.log('e: ', e);
        setSearch(e);
        if (e == '') {
            console.log('if: ');
            refresh();
        } else {
            console.log('else: ');
            const res = await categoryListRefetch({
                variables: {
                    channel: 'india-channel',
                    search: e,
                    last: PAGE_SIZE,
                    before: startCursor,
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

    const BulkDeleteCategory = async () => {
        showDeleteAlert(
            async () => {
                if (selectedRecords.length === 0) {
                    Swal.fire('Cancelled', 'Please select at least one record!', 'error');
                    return;
                }
                selectedRecords?.map(async (item: any) => {
                    await bulkDelete({ variables: { id: item.id } });
                });
                const updatedRecordsData = recordsData.filter((record) => !selectedRecords.includes(record));
                setRecordsData(updatedRecordsData);
                // setCategoryList(updatedRecordsData);
                setSelectedRecords([]);

                Swal.fire('Deleted!', 'Your files have been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    const DeleteCategory = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data } = await deleteCategory({ variables: { id: record.id } });
                const updatedRecordsData = recordsData.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                // setCategoryList(updatedRecordsData);
                // getCategoryList()
                setSelectedRecords([]);
                // setCategoryList(finishList)
                // await categoryListRefetch();

                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your List is safe :)', 'error');
            }
        );
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex-col gap-5 md:flex md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Categories ({totalCount})</h5>

                    <div className="mt-5 md:mt-0 md:flex  md:ltr:ml-auto md:rtl:mr-auto">
                        <input type="text" className="form-input mb-3 mr-2 w-full md:mb-0 md:w-auto" placeholder="Search..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />
                        <div className="dropdown  mb-3 mr-0  md:mb-0 md:mr-2">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="btn btn-outline-primary dropdown-toggle lg:w-auto w-full"
                                button={
                                    <>
                                        Bulk Actions
                                        <span>
                                            <IconCaretDown className="inline-block ltr:ml-1 rtl:mr-1" />
                                        </span>
                                    </>
                                }
                            >
                                <ul className="!min-w-[170px]">
                                    <li>
                                        <button type="button" onClick={() => BulkDeleteCategory()}>
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                        <button type="button" className="btn btn-primary w-full md:mb-0 md:w-auto" onClick={() => router.push('/product/createCategory')}>
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
                                // { accessor: 'id', sortable: true },
                                {
                                    accessor: 'image',
                                    sortable: true,
                                    render: (row) => <img src={row?.image ? row?.image : '/assets/images/placeholder.png'} alt="Product" className="h-10 w-10 object-cover ltr:mr-2 rtl:ml-2" />,
                                },
                                { accessor: 'name', sortable: true },
                                {
                                    accessor: 'textdescription',
                                    sortable: true,
                                    title: 'Description',
                                },
                                {
                                    accessor: 'parent',
                                    sortable: true,
                                },
                                {
                                    accessor: 'menuOrder',
                                    sortable: true,
                                },

                                {
                                    accessor: 'product',
                                    sortable: true,

                                    render: (row: any) => <button onClick={() => router.push(`/?category=${row.id}`)}>{row.product}</button>,
                                },

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
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push({
                                                            pathname: '/product/editCategory',
                                                            query: { id: row.id },
                                                        })
                                                    }
                                                >
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
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={(val) => {
                                setSelectedRecords(val);
                            }}
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
        </div>
    );
};

export default PrivateRouter(Category);
