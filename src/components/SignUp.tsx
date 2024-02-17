import userSchema, { User } from "@/schema";
import Form from "./Form";
import axios from "axios";
import { SERVER_URL } from "@/environment";
import { useFormik } from "formik";

function SignUp() {
    const formik = useFormik({
        initialValues: {
            userName: "",
            password: "",
        },
        validationSchema: userSchema,
        onSubmit: async (values: User) => {
            //FIXME: this is onlogin
            const response = await axios.post(`${SERVER_URL}/users/create`, values);console.log(response);
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
