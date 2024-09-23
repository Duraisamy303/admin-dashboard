import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';

import { useEffect, useState } from 'react';
import { setPageTitle, toggleLocale, toggleRTL } from '../../store/themeConfigSlice';
import { useRouter } from 'next/router';
import BlankLayout from '@/components/Layouts/BlankLayout';
import Dropdown from '@/components/Dropdown';
import { useTranslation } from 'react-i18next';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconMail from '@/components/Icon/IconMail';
import IconLockDots from '@/components/Icon/IconLockDots';
import IconInstagram from '@/components/Icon/IconInstagram';
import IconFacebookCircle from '@/components/Icon/IconFacebookCircle';
import IconTwitter from '@/components/Icon/IconTwitter';
import IconGoogle from '@/components/Icon/IconGoogle';
import { useMutation } from '@apollo/client';
import { CHECKOUT_TOKEN, LOGIN } from '@/query/auth';
import { Failure, Success } from '@/utils/functions';
import IconLoader from '@/components/Icon/IconLoader';

const LoginBoxed = () => {
    const [addFormData] = useMutation(LOGIN);

    const [checkoutTokens] = useMutation(CHECKOUT_TOKEN);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        subscribe: false,
    });

    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Login Boxed'));
    });
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            router.replace('/');
        }
    }, []);

    const getCheckoutToken = async (email: any) => {
        try {
            const data = await checkoutTokens({
                variables: { channel: 'india-channel', email },
            });
            const checkoutToken = data?.data?.checkoutCreate?.checkout?.token;
            return checkoutToken;
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const submitForm = async () => {
        setLoading(true);
        const { data } = await addFormData({
            variables: { email: formData.email, password: formData.password },
        });
        if (data?.tokenCreate?.errors?.length > 0) {
            Failure(data?.tokenCreate?.errors[0]?.message);
            setLoading(false);
        } else {
            console.log('data?.tokenCreate: ', data?.tokenCreate);

            localStorage.setItem('adminToken', data?.tokenCreate?.token);
            localStorage.setItem('user', data?.tokenCreate?.user);
            localStorage.setItem('userEmail', data?.tokenCreate?.user?.email);
            localStorage.setItem('userName', data?.tokenCreate?.user?.firstName);
            localStorage.setItem('refreshToken', data?.tokenCreate?.refreshToken);

            // notifySuccess("Login successfully");
            const checkoutToken: any = await getCheckoutToken(data?.data?.data?.tokenCreate?.user?.email);
            console.log('checkoutToken: ', checkoutToken);
            localStorage.setItem('checkoutToken', checkoutToken);
            setLoading(false);
            router.replace('/');
            Success('Login successfully');
        }
        console.log('data: ', data);

        // e.preventDefault();
        // router.push('/');
    };
    const isRtl = useSelector((state: any) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const themeConfig = useSelector((state: any) => state.themeConfig);
    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState('');

    // useEffect(() => {
    //     setLocale(localStorage.getItem('i18nextLng') || themeConfig.locale);
    // }, []);

    const { t, i18n } = useTranslation();

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData((prevState) => ({
            ...prevState,
            [name]: newValue,
        }));
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 px-6 py-20 backdrop-blur-lg dark:bg-black/50 lg:min-h-[500px]">
                        <div className="absolute end-6 top-6">
                            <div className="dropdown">
                                {flag && (
                                    <Dropdown
                                        offset={[0, 8]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        btnClassName="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
                                        button={
                                            <>
                                                <div>
                                                    <img src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="image" className="h-5 w-5 rounded-full object-cover" />
                                                </div>
                                                <div className="text-base font-bold uppercase">{flag}</div>
                                                <span className="shrink-0">
                                                    <IconCaretDown />
                                                </span>
                                            </>
                                        }
                                    >
                                        <ul className="grid w-[280px] grid-cols-2 gap-2 !px-2 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                            {themeConfig.languageList.map((item: any) => {
                                                return (
                                                    <li key={item.code}>
                                                        <button
                                                            type="button"
                                                            className={`flex w-full rounded-lg hover:text-primary ${i18n.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                                            onClick={() => {
                                                                dispatch(toggleLocale(item.code));
                                                                i18n.changeLanguage(item.code);
                                                                setLocale(item.code);
                                                            }}
                                                        >
                                                            <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="h-5 w-5 rounded-full object-cover" />
                                                            <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </Dropdown>
                                )}
                            </div>
                        </div>
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
                            </div>
                            <form className="space-y-5 dark:text-white">
                                <div>
                                    <label htmlFor="Email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter Email"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            onInput={(e: any) => {
                                                e.target.value = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, '');
                                            }}
                                            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                                        />
                                        {/* <input id="Email" type="email" placeholder="Enter Email" className="form-input ps-10 placeholder:text-white-dark" /> */}
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Password"
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter Password"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                        />
                                        {/* <input id="Password" type="password" placeholder="Enter Password" className="form-input ps-10 placeholder:text-white-dark" /> */}
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>
                                {/* <div>
                                    <label className="flex cursor-pointer items-center">
                                        <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                                        <span className="text-white-dark">Subscribe to weekly newsletter</span>
                                    </label>
                                </div> */}
                                {/* <button onClick={() => console.log('first')} className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    Sign in
                                </button> */}
                            </form>

                            <button
                                onClick={() => submitForm()}
                                className="btn  animate__animated animate__fadeIn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                            >
                                {loading ? <IconLoader /> : 'Sign in'}
                            </button>
                            {/* <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div>
                            <div className="mb-10 md:mb-[60px]">
                                <ul className="flex justify-center gap-3.5 text-white">
                                    <li>
                                        <Link
                                            href="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconInstagram />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconFacebookCircle />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconTwitter fill={true} />
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                                        >
                                            <IconGoogle />
                                        </Link>
                                    </li>
                                </ul>
                            </div> */}
                            {/* <div className="text-center dark:text-white mt-5">
                                Don't have an account ?&nbsp;
                                <Link href="/auth/boxed-signup" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN UP
                                </Link>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
LoginBoxed.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};
export default LoginBoxed;
