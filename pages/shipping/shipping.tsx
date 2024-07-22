import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState, Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';

import Swal from 'sweetalert2';
import IconEye from '@/components/Icon/IconEye';
import Link from 'next/link';
import { useRouter } from 'next/router';
import IconEdit from '@/components/Icon/IconEdit';
import { Dialog, Transition } from '@headlessui/react';
import { Field, Formik, Form } from 'formik';
import * as Yup from 'yup';
import IconX from '@/components/Icon/IconX';
import PrivateRouter from '@/components/Layouts/PrivateRouter';

const rowData = [
    {
        id: 1,
        zonename: 'India',
        regions: 'India',
        shippingmethod: 'Flat Rate',
        taxstatus: 'Taxable',
        cost: 200,
    },
    {
        id: 2,
        zonename: 'Rest of the world',
        regions: 'America, Canada, Europe, Pakistan',
        shippingmethod: 'Flat Rate',
        taxstatus: 'none',
        cost: 0,
    },
];
const Shipping = () => {
    const router = useRouter();
    const isRtl = useSelector((state:any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Checkbox Table'));
    });
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(rowData, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [modal1, setModal1] = useState(false);
    const [modalTitle, setModalTitle] = useState(null);
    const [modalContant, setModalContant] = useState<any>(null);

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

    // Product table create
    const CreateFinish = () => {
        setModal1(true);
        setModalTitle(null);
        setModalContant(null);
    };

    // FORM VALIDATION
    const SubmittedForm = Yup.object().shape({
        zonename: Yup.string().required('Please fill the Zone Name'),
        regions: Yup.string().required('Please fill the Regions'),
        shippingmethod: Yup.string().required('Please fill the Shipping Method'),
    });

    const onSubmit = async (record: any, { resetForm }: any) => {
        setModal1(false);
        resetForm();
    };

    // category table edit
    const EditShipping = (row: any) => {
        setModal1(true);
        setModalTitle(row);
        setModalContant({ ...row });
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
                text: "You won't be able to Delete this!",
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

    const DeleteProduct = (record: any) => {
        showDeleteAlert(
            () => {
                const updatedRecordsData = recordsData.filter((dataRecord: any) => dataRecord.id !== record.id);
                setRecordsData(updatedRecordsData);
                Swal.fire('Deleted!', 'Your Product has been deleted.', 'success');
            },
            () => {
                Swal.fire('Cancelled', 'Your Product List is safe :)', 'error');
            }
        );
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Shipping</h5>

                    <div className="flex ltr:ml-auto rtl:mr-auto">
                        <button type="button" className="btn btn-primary" onClick={() => CreateFinish()}>
                            + Create
                        </button>
                    </div>
                </div>

                <div className="datatables">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={recordsData}
                        columns={[
                            { accessor: 'id', sortable: true, title: 'ID' },
                            { accessor: 'zonename', sortable: true, title: 'Zone Name' },
                            { accessor: 'regions', sortable: true, title: 'Region(s)' },
                            { accessor: 'shippingmethod', sortable: true, title: 'Shipping Method(s)' },
                            { accessor: 'taxstatus', sortable: true, title: 'Tax Status' },
                            { accessor: 'cost', sortable: true, title: 'Cost' },
                            {
                                // Custom column for actions
                                accessor: 'actions', // You can use any accessor name you want
                                title: 'Actions',
                                // Render method for custom column
                                render: (row: any) => (
                                    <>
                                        <div className=" flex w-max items-center justify-start gap-4">
                                            <button type="button" className="flex hover:text-primary" onClick={() => EditShipping(row)}>
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </button>

                                            {/* <Link href="/apps/product/view" className="flex hover:text-primary">
                                                <IconEye />
                                            </Link> */}

                                            <button type="button" className="flex hover:text-danger" onClick={() => DeleteProduct(row)}>
                                                <IconTrashLines />
                                            </button>
                                        </div>
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
            </div>

            {/* CREATE AND EDIT CATEGORY FORM */}
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
                                        <div className="text-lg font-bold">{modalTitle === null ? 'Create Shipping' : 'Edit Shipping'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal1(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="mb-5 p-5">
                                        <Formik
                                            initialValues={
                                                modalContant === null
                                                    ? { zonename: '', regions: '', shippingmethod: '', taxstatus: '', cost: '' }
                                                    : {
                                                          zonename: modalContant?.zonename || '',
                                                          regions: modalContant?.regions || '',
                                                          shippingmethod: modalContant?.shippingmethod || '',
                                                          taxstatus: modalContant?.taxstatus || '',
                                                          cost: modalContant?.cost || '',
                                                      }
                                            }
                                            validationSchema={SubmittedForm}
                                            onSubmit={(values, { resetForm }) => {
                                                onSubmit(values, { resetForm }); // Call the onSubmit function with form values and resetForm method
                                            }}
                                        >
                                            {({ errors, submitCount, touched, setFieldValue, values }: any) => (
                                                <Form className="space-y-5">
                                                    <div className={submitCount ? (errors.zonename ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="zonename">Zone name </label>
                                                        <Field name="zonename" type="text" id="zonename" placeholder="Enter Name" className="form-input" />

                                                        {submitCount ? errors.zonename ? <div className="mt-1 text-danger">{errors.zonename}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>
                                                    <div className={submitCount ? (errors.regions ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="regions">Zone regions</label>
                                                        <Field as="select" name="regions" className="form-select">
                                                            <option value="">Open this select menu</option>
                                                            <option value="India">India</option>
                                                            <option value="America">America</option>
                                                            <option value="Canada">Canada</option>
                                                        </Field>
                                                        {submitCount ? errors.regions ? <div className=" mt-1 text-danger">{errors.regions}</div> : <div className=" mt-1 text-[#1abc9c]"></div> : ''}
                                                    </div>

                                                    <h2 className="text-lg font-bold">Shipping methods</h2>

                                                    <div className={submitCount ? (errors.shippingmethod ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="method-title">Method Title</label>
                                                        <Field as="select" name="shippingmethod" className="form-select">
                                                            <option value="">Open this select menu</option>
                                                            <option value="flat-rate">Flat Rate</option>
                                                        </Field>
                                                        {submitCount ? (
                                                            errors.shippingmethod ? (
                                                                <div className=" mt-1 text-danger">{errors.shippingmethod}</div>
                                                            ) : (
                                                                <div className=" mt-1 text-[#1abc9c]"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div>
                                                    <div className={submitCount ? (errors.taxstatus ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="tax-status">Tax status</label>
                                                        <Field as="select" name="taxstatus" className="form-select">
                                                            <option value="none">None</option>
                                                            <option value="Taxable">Taxable</option>
                                                        </Field>
                                                        {submitCount ? (
                                                            errors.taxstatus ? (
                                                                <div className=" mt-1 text-danger">{errors.taxstatus}</div>
                                                            ) : (
                                                                <div className=" mt-1 text-[#1abc9c]"></div>
                                                            )
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div>

                                                    <div className={submitCount ? (errors.cost ? 'has-error' : 'has-success') : ''}>
                                                        <label htmlFor="cost">Cost</label>
                                                        <Field name="cost" type="number" id="cost" placeholder="Enter Count" className="form-input" />

                                                        {submitCount ? errors.cost ? <div className="mt-1 text-danger">{errors.cost}</div> : <div className="mt-1 text-success"></div> : ''}
                                                    </div>

                                                    <button type="submit" className="btn btn-primary !mt-6">
                                                        {modalTitle === null ? 'Submit' : 'Update'}
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

export default PrivateRouter(Shipping) ; 
