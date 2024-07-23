import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconPencil from '@/components/Icon/IconPencil';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/Icon/IconX';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { CREATE_PAYMENT, PAYMENT_LIST, UPDATE_PAYMENT } from '@/query/product';
import { useMutation, useQuery } from '@apollo/client';
import IconLoader from '@/components/Icon/IconLoader';
import PrivateRouter from '@/components/Layouts/PrivateRouter';
import { Success, objIsEmpty } from '@/utils/functions';
import CommonLoader from './elements/commonLoader';

const Payments = () => {
    const {
        data: paymentData,
        refetch: paymentRefetch,
        loading: dataLoading,
    } = useQuery(PAYMENT_LIST, {
        variables: { channel: 'india-channel', first: 20 },
    });

    const [paymentList, setPaymentList] = useState([]);

    useEffect(() => {
        getFinishList();
    }, [paymentData]);

    const getFinishList = () => {
        if (paymentData) {
            const data = paymentData?.paymentGateways?.edges;
            const updateData = data?.map((item) => ({
                name: item?.node?.name,
                status: item?.node?.isActive,
                description: item?.node?.description,
                id: item?.node?.id,
            }));
            setPaymentList(updateData);
        }
    };

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState([]); // Initialize initialRecords with an empty array
    const [recordsData, setRecordsData] = useState([]);

    useEffect(() => {
        setInitialRecords(paymentList);
    }, [paymentList]);

    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [modal1, setModal1] = useState(false);
    const [modalTitle, setModalTitle] = useState(null);
    const [modalContant, setModalContant] = useState<any>(null);

    const [addPayment, { loading: createLoader }] = useMutation(CREATE_PAYMENT);
    const [updatePayment, { loading: updateLoader }] = useMutation(UPDATE_PAYMENT);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required('Please fill the Name'),
    });

    const onSubmit = async (record: any, { resetForm }: any) => {
        try {
            //Add
            if (modalContant?.name) {
                const update = {
                    id: record.id,
                    input: {
                        name: record.name,
                        isActive: modalContant?.status ? modalContant?.status : false,
                        description: record.description,
                    },
                };

                const res = await updatePayment({
                    variables: update,
                });
                Success('Payment method updated successfully');
            }
            //Edit
            else {
                const create = {
                    input: {
                        name: record.name,
                        isActive: modalContant?.status ? modalContant?.status : false,
                        description: record.description,
                    },
                };
                const res = await addPayment({
                    variables: create,
                });
                Success('Payment method created successfully');
            }
            paymentRefetch();
            setModalContant(null);
            setModal1(false);
            resetForm();
        } catch (error) {}
    };

    const EditPayment = (record: any) => {
        setModal1(true);
        setModalTitle(record);
        setModalContant(record);
    };

    const CreateFinish = () => {
        setModal1(true);
        setModalTitle(null);
        setModalContant(null);
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex-col gap-5 md:flex md:flex-row md:items-center ">
                    <h5 className="text-lg font-semibold dark:text-white-light">Payments List</h5>

                    <div className="mt-5 md:mt-0 md:flex  md:ltr:ml-auto md:rtl:mr-auto">
                        <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => CreateFinish()}>
                            + Create
                        </button>
                    </div>
                </div>
                {dataLoading ? (
                    <CommonLoader />
                ) : (
                    <div className="datatables">
                        <DataTable
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
                            columns={[
                                { accessor: 'name', sortable: true },
                                {
                                    accessor: 'status',
                                    sortable: true,
                                    render: (row: any) => (
                                        <div className="disabled: flex">
                                        {/* <div>{row?.status?"Enabled":"Disabled"}</div> */}

                                        <div className={`flex w-max gap-4 rounded-full px-2 py-1 ${row?.status ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'}`}>
                                                {row?.status ? 'Enabled' : 'Disabled'}
                                            </div>
                                            {/* <div className={`flex h-5 w-10 items-center rounded-full p-1 transition duration-300 ease-in-out ${row.status ? 'bg-primary' : 'bg-gray-300'}`}>
                                                <div
                                                    className={`h-4 w-4 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
                                                        row.status ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                ></div>
                                            </div> */}
                                        </div>
                                    ),
                                },

                                { accessor: 'description', sortable: true },

                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <>
                                            <Tippy content="Edit">
                                                <button type="button" onClick={() => EditPayment(row)}>
                                                    <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                                </button>
                                            </Tippy>
                                        </>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={initialRecords.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={(selectedRecords) => {
                                setSelectedRecords(selectedRecords);
                            }}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                )}
            </div>

            <Transition appear show={modal1} as={Fragment}>
                <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">{modalTitle === null ? 'Create Payment Method' : 'Edit Payment Method'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5">
                                        <Formik
                                            initialValues={
                                                modalContant === null
                                                    ? { name: '', status: false, description: '' }
                                                    : {
                                                          name: modalContant?.name,
                                                          status: modalContant?.status,
                                                          description: modalContant?.description,
                                                          id: modalContant?.id,
                                                      }
                                            }
                                            validationSchema={SubmittedForm}
                                            onSubmit={(values, { resetForm }) => {
                                                onSubmit(values, { resetForm });
                                            }}
                                        >
                                            {({ errors, submitCount, touched, setFieldValue, values }: any) => (
                                                <Form className="space-y-5">
                                                    <div className={submitCount ? (errors.name ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="fullName">Name </label>
                                                        <Field name="name" type="text" id="fullName" placeholder="Enter Name" className="form-input" />

                                                        {submitCount ? errors.name ? <div className="mt-1 text-danger">{errors.name}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>
                                                    <div className="">
                                                        <label htmlFor="fullName">Enabled </label>

                                                        <div
                                                            className={`flex h-5 w-10 items-center rounded-full p-1 transition duration-300 ease-in-out ${
                                                                modalContant?.status ? 'bg-primary' : 'bg-gray-300'
                                                            }`}
                                                            onClick={() => {
                                                                setModalContant((prevState) => ({
                                                                    ...prevState,
                                                                    status: !prevState?.status,
                                                                }));
                                                            }}
                                                        >
                                                            <div
                                                                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
                                                                    modalContant?.status ? 'translate-x-5' : 'translate-x-0'
                                                                }`}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div className={submitCount ? (errors.description ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="description">Description </label>
                                                        <Field name="description" as="textarea" id="description" placeholder="Enter Description" className="form-input" />
                                                    </div>

                                                    <button type="submit" className="btn btn-primary !mt-6">
                                                        {createLoader || updateLoader ? <IconLoader className="me-3 h-4 w-4 shrink-0 animate-spin" /> : modalTitle === null ? 'Submit' : 'Update'}
                                                    </button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default PrivateRouter(Payments);
