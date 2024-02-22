import Form from "@/components/Form";
import { SERVER_URL } from "@/environment";
import userSchema, { User } from "@/schema";
import axios from "axios";
import { FormikProps, useFormik } from "formik";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigateTo = useNavigate();
    const formik: FormikProps<User> = useFormik<User>({
        initialValues: {
            userName: "",
            password: "",
        },
        validationSchema: userSchema,
        onSubmit: async (values: User, {setStatus}) => {
            try {
                const response = await axios.get(`${SERVER_URL}/users/login`, {
                    params: {
                        userInfo: values,
                    },
                    withCredentials: true,
                });
                if (response.status === 200) {
                    navigateTo("/auth/chat");
                }
            } catch (err) {
                setStatus('Username or Password invalid')
                console.error(err);
            }
        },
    });
    return (
        <main className="bg-stone-800 h-svh w-svw flex items-center justify-center">
            <section className="bg-white rounded max-w-96 h-max w-4/5 p-2 flex items-center justify-center">
                <Form
                    label="Login"
                    oppositeLink="/signup"
                    formik={formik}
                    oppositeLinkText="Don't have an account? SignUp"
                ></Form>
            </section>
        </main>
    );
}

export default Login;
