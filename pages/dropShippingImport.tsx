import React, { useState } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { DataTable } from 'mantine-datatable';
import 'tippy.js/dist/tippy.css';
import moment from 'moment';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import CommonLoader from './elements/commonLoader';
import { ABANDONT_CART_LIST, CREATE_DROP_SHIPPING, DELETE_DROP_SHIPPING, GET_DROP_SHIPPING, IMPORT_DROP_SHIPPING, UPDATE_DROP_SHIPPING } from '@/query/product';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import { useRouter } from 'next/router';
import Modal from '@/components/Modal';
import Select from 'react-select';
import { Failure, Success, formatTime, generateTimeOptions, isValidUrl, showDeleteAlert } from '@/utils/functions';
import IconLoader from '@/components/Icon/IconLoader';
import { IconImport } from '@/components/Icon/IconImport';
import IconEdit from '@/components/Icon/IconEdit';
import IconTrash from '@/components/Icon/IconTrash';
import Swal from 'sweetalert2';
import IconRefresh from '@/components/Icon/IconRefresh';

const PAGE_SIZE = 20;

const AbandonedCarts = () => {
    const router = useRouter();

    const [recordsData, setRecordsData] = useState([]);
    const [startCursor, setStartCursor] = useState(null);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [sheetUrl, setSheetUrl] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [firstRunTime, setFirstRunTime] = useState(null);
    const [secondRunTime, setSecondRunTime] = useState(null);
    const [thirdRunTime, setThirdRunTime] = useState(null);
    const [editId, setEditId] = useState(null);
    const [loadingRowId, setLoadingRowId] = useState(null);

    const [creates, { loading: createLoading }] = useMutation(CREATE_DROP_SHIPPING);
    const [updates, { loading: updateLoading }] = useMutation(UPDATE_DROP_SHIPPING);
    const [deletes, { loading: deleteLoading }] = useMutation(DELETE_DROP_SHIPPING);

    const [imports, { loading: importLoading }] = useMutation(IMPORT_DROP_SHIPPING);

    const { loading: getLoading, refetch: fetchLowStockList } = useQuery(GET_DROP_SHIPPING, {
        variables: {
            channel: 'india-channel',
            first: PAGE_SIZE,
            after: null,
        },
        onCompleted: (data) => {
            console.log('data: ', data);

            const products = data?.googlesheet?.edges;
            setRecordsData(tableFormat(products));
            const pageInfo = data?.googlesheet?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchNextPage] = useLazyQuery(GET_DROP_SHIPPING, {
        onCompleted: (data) => {
            const products = data?.googlesheet?.edges;
            const pageInfo = data?.googlesheet?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const [fetchPreviousPage] = useLazyQuery(GET_DROP_SHIPPING, {
        onCompleted: (data) => {
            const products = data?.googlesheet?.edges || [];
            const pageInfo = data?.googlesheet?.pageInfo;
            setRecordsData(tableFormat(products));
            setStartCursor(pageInfo?.startCursor || null);
            setEndCursor(pageInfo?.endCursor || null);
            setHasNextPage(pageInfo?.hasNextPage || false);
            setHasPreviousPage(pageInfo?.hasPreviousPage || false);
        },
    });

    const handleNextPage = () => {
        console.log('handleNextPage: ');
        fetchNextPage({
            variables: {
                channel: 'india-channel',
                first: PAGE_SIZE,
                after: endCursor,
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

    const updateData = (row) => {
        if (row.firstRunTime) {
            setFirstRunTime(formatTime(row.firstRunTime));
        }
        if (row.secondRunTime) {
            setSecondRunTime(formatTime(row.secondRunTime));
        }
        if (row.thirdRunTime) {
            setThirdRunTime(formatTime(row.thirdRunTime));
        }
        setSheetUrl(row.ID);
        setEditId(row.id);
        setIsEditOpen(true);
    };

    const createData = (isOpen: boolean) => {
        setFirstRunTime(null);
        setSecondRunTime(null);
        setThirdRunTime(null);
        setSheetUrl(null);
        setEditId(null);
        setIsEditOpen(isOpen);
    };

    const importData = async (row) => {
        try {
            setLoadingRowId(row.id);
            const data = await imports({
                variables: { id: row.id },
            });
            Success('Import Successfully');
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const updateRow = async () => {
        try {
            if (sheetUrl == null || sheetUrl == '') {
                Failure('URL is required');
            } else if (!isValidUrl(sheetUrl)) {
                Failure('Enter valid URL');
            } else {
                const data = await updates({
                    variables: {
                        id: editId,
                        input: {
                            sheetUrl,
                            firstRunTime: firstRunTime.value,
                            secondRunTime: secondRunTime.value,
                            thirdRunTime: thirdRunTime.value,
                        },
                    },
                });
                setIsEditOpen(false);
                await refresh();
                Success('Updated Successfully');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const createShipping = async () => {
        try {
            if (sheetUrl == null || sheetUrl == '') {
                Failure('URL is required');
            } else if (!isValidUrl(sheetUrl)) {
                Failure('Enter valid URL');
            } else {
                const data = await creates({
                    variables: {
                        input: {
                            sheetUrl,
                            firstRunTime: firstRunTime ? firstRunTime?.value : null,
                            secondRunTime: secondRunTime ? secondRunTime?.value : null,
                            thirdRunTime: thirdRunTime ? thirdRunTime?.value : null,
                        },
                    },
                });
                setIsEditOpen(false);
                await refresh();
                Success('Created Successfully');
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const refresh = async () => {
        try {
            const { data } = await fetchLowStockList({
                variables: {
                    channel: 'india-channel',
                    first: PAGE_SIZE,
                    after: endCursor,
                },
            });
            const products = data?.googlesheet?.edges;
            setRecordsData(tableFormat(products));
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const deleteShipping = (record: any) => {
        showDeleteAlert(
            async () => {
                const { data }: any = deletes({
                    variables: {
                        id: record.id,
                    },
                });
                Swal.fire('Deleted!', 'Your Product has been deleted.', 'success');
                await refresh();
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    return (
        <div>
            <div className="panel mb-5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-light">Drop Shipping Import</h5>
                <button type="button" className="btn btn-primary" onClick={() => createData(true)}>
                    Create
                </button>
            </div>
            <div className="panel mt-6">
                {getLoading ? (
                    <CommonLoader />
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                {
                                    accessor: 'ID',
                                    title: 'ID',
                                    sortable: true,
                                    width: 300,
                                    render: (row) => (
                                        <div
                                            onClick={() => window.open(row?.ID, '_blank')}
                                            className="cursor-pointer text-info underline"
                                            style={{
                                                width: '250px',
                                                whiteSpace: 'normal', // Allows wrapping
                                                wordWrap: 'break-word', // Ensures long words wrap to the next line
                                            }}
                                        >
                                            {row.ID}
                                        </div>
                                    ),
                                },
                                { accessor: 'firstRunTime', sortable: true },
                                { accessor: 'secondRunTime', sortable: true },
                                { accessor: 'thirdRunTime', sortable: true },
                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <>
                                            <div className=" flex w-max  gap-4">
                                                <button className="flex hover:text-info" onClick={() => importData(row)}>
                                                    {loadingRowId === row.id && importLoading ? (
                                                        <IconLoader className="me-2 h-6 w-6 shrink-0 animate-spin" />
                                                    ) : (
                                                        <IconRefresh className="me-1 h-6 w-6" />
                                                    )}
                                                </button>

                                                <button type="button" className="flex hover:text-info" onClick={() => updateData(row)}>
                                                    <IconEdit />
                                                </button>
                                                <button type="button" className="flex hover:text-info" onClick={() => deleteShipping(row)}>
                                                    <IconTrash />
                                                </button>
                                            </div>
                                        </>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={recordsData.length}
                            recordsPerPage={PAGE_SIZE}
                            page={null} // Add this line to set the current page
                            onPageChange={(p) => {}} // Dummy handler for onPageChange
                            sortStatus={{
                                columnAccessor: 'name',
                                direction: 'asc',
                            }}
                            onSortStatusChange={() => {}}
                            withBorder={true}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => ''}
                        />
                        <div className="mt-5 flex justify-end gap-3">
                            <button disabled={!hasPreviousPage} onClick={handlePreviousPage} className={`btn ${!hasPreviousPage ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowBackward />
                            </button>
                            <button disabled={!hasNextPage} onClick={handleNextPage} className={`btn ${!hasNextPage ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowForward />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Modal
                addHeader={editId ? 'Update Shipping Import' : 'Add Shipping Import'}
                open={isEditOpen}
                isFullWidth
                close={() => createData(false)}
                renderComponent={() => (
                    <div className="scroll-auto p-10 pb-7">
                        <div className=" flex justify-between">
                            <label htmlFor="name">URL</label>
                        </div>
                        <div className="flex w-full">
                            <input type="text" className="form-input " placeholder="Sheet URL" value={sheetUrl} onChange={(e: any) => setSheetUrl(e.target.value)} min={0} />
                        </div>
                        <div className=" mt-3 flex justify-between">
                            <label htmlFor="name">First RunTime</label>
                        </div>
                        <Select
                            placeholder="Minimum Requirements"
                            options={generateTimeOptions()}
                            value={firstRunTime}
                            onChange={(e) => {
                                setFirstRunTime(e);
                            }}
                            isSearchable={true}
                        />
                        <div className=" mt-3 flex justify-between">
                            <label htmlFor="name">Second RunTime</label>
                        </div>
                        <Select
                            placeholder="Minimum Requirements"
                            options={generateTimeOptions()}
                            value={secondRunTime}
                            onChange={(e) => {
                                setSecondRunTime(e);
                            }}
                            isSearchable={true}
                        />
                        <div className=" mt-3 flex justify-between">
                            <label htmlFor="name">Third RunTime</label>
                        </div>
                        <Select
                            placeholder="Third Run Time"
                            options={generateTimeOptions()}
                            value={thirdRunTime}
                            onChange={(e) => {
                                setThirdRunTime(e);
                            }}
                            isSearchable={true}
                        />

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger gap-2" onClick={() => createData(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => (editId ? updateRow() : createShipping())}>
                                {createLoading || updateLoading ? <IconLoader className="me-3 h-4 w-4 shrink-0 animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

const tableFormat = (products) => {
    return products.map((product) => ({
        ID: product?.node?.sheetUrl,
        firstRunTime: product?.node?.firstRunTime,
        secondRunTime: product?.node?.secondRunTime,
        thirdRunTime: product?.node?.thirdRunTime,
        id: product?.node?.id,
    }));
};

export default PrivateRouter(AbandonedCarts);
