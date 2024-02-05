import { Link } from "react-router-dom";
import Error from "./Error";
import userSchema, { User } from "@/schema";
import { useFormik } from "formik";

function Form() {
    const formik = useFormik({
        initialValues: {
            userName: "",
            password: "",
        },
        validationSchema: userSchema,
        onSubmit: (values: User) => {
            console.log(values);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} method="post" noValidate className="flex flex-col items-center w-full h-full justify-between p-2 py-5">
            <label htmlFor="" className="text-3xl h-max font-bold">
                Login
            </label>
            <section className="flex flex-col gap-3 w-full h-full p-3">
                <label htmlFor="userName" className="text-sm font-bold">
                    Username:
                </label>
                <input
                    className="w-full border-stone-400 h-8 p-1 bg-white border-2 rounded" 
                    type="text" name="userName" id="userName" 
                    value={formik.values.userName} 
                    onChange={formik.handleChange} 
                />
                <Error text={formik.errors.userName!} className="text-red-500 w-full h-6 text-sm">

                </Error>
                <label htmlFor="userPassword" className="text-sm font-bold">
                    Password:
                </label>
                <input
                    className="w-full border-stone-400 h-8 p-1 bg-white border-2 rounded" 
                    type="password" name="password" id="password" 
                    value={formik.values.password} 
                    onChange={formik.handleChange} 
                />
                <Error text={formik.errors.password!} className="text-red-500 w-full h-6 text-sm">

                </Error>
                <input 
                    className="bg-blue-600 text-white p-2 cursor-pointer hover:bg-blue-700 rounded w-full h-10" type="submit" value="Login"
                />
                <Link 
                    className="text-blue-600 cursor-pointer h-6 w-full text-sm text-center hover:underline" to={"/signup"}
                >
                    Already have an Account? SignUp
                </Link>
            </section>
        </form>
    );
}

export default Form;
