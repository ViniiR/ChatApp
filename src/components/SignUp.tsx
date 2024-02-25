import userSchema, { User } from "@/schema";
import Form from "./Form";
import axios from "axios";
import { SERVER_URL } from "@/environment";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

function SignUp() {
    const navigateTo = useNavigate()
    const formik = useFormik({
        initialValues: {
            userName: "",
            password: "",
        },
        validationSchema: userSchema,
        onSubmit: async (values: User, { setStatus }) => {
            try {
                //creates account
                await axios.post(`${SERVER_URL}/users/create`, values);
                setStatus("User created successfully, Go to Login");
                //instantly logs in
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
                setStatus("User already exists, Try a different Username");
                console.error(err);
            }
        },
    });
    return (
        <main className="bg-stone-800 h-svh w-svw flex items-center justify-center">
            <section className="bg-white rounded max-w-96 h-max w-4/5 p-2 flex items-center justify-center">
                <Form
                    label="SignUp"
                    oppositeLink="/login"
                    formik={formik}
                    oppositeLinkText="Already have an account? Login"
                ></Form>
            </section>
        </main>
    );
}

export default SignUp;
