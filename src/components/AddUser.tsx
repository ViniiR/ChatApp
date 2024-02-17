import { MouseEvent, MouseEventHandler, RefObject } from "react";
import Error from "./Error";
import { useFormik } from "formik";
import { friendSchema } from "@/schema";
import axios from "axios";
import { SERVER_URL } from "@/environment";

type AddUserProps = {
    menuRef: RefObject<HTMLDivElement>;
    closeMenu: MouseEventHandler;
};

function AddUser({ menuRef, closeMenu }: AddUserProps) {
    function disableOutsideClicks(event: MouseEvent) {
        event.stopPropagation();
    }
    const formik = useFormik({
        initialValues: {
            userName: "",
        },
        validationSchema: friendSchema,
        async onSubmit(values: { userName: string }, { setStatus }) {
            axios
                .patch(`${SERVER_URL}/users/add-contact`, values, {
                    withCredentials: true,
                })
                .then((data) => {
                    setStatus(data.data);
                    (closeMenu as CallableFunction)();
                })
                .catch((err) => {
                    setStatus(err.response.data);
                });
        },
    });

    return (
        <div
            ref={menuRef}
            className="fixed w-full h-full bg-black bg-opacity-60 rounded hidden items-center justify-center m-auto shadow-sm"
            onClick={disableOutsideClicks}
        >
            <form
                action="POST"
                className="rounded bg-white p-2 h-2/3 w-1/2 flex flex-col text-black items-end"
                onSubmit={formik.handleSubmit}
            >
                <button
                    onClick={closeMenu}
                    className="text-black w-10 h-10 inline-block relative"
                >
                    <span
                        className="w-10 h-1 bg-stone-700 rounded block absolute"
                        style={{
                            transform: "rotate(45deg)",
                        }}
                    ></span>
                    <span
                        className="w-10 h-1 bg-stone-700 rounded block absolute"
                        style={{
                            transform: "rotate(-45deg)",
                        }}
                    ></span>
                </button>
                <section className="w-full h-full flex flex-col justify-around gap-1">
                    <label
                        className=" w-full h-max font-bold text-xl text-center"
                        htmlFor=""
                    >
                        Add a friend
                    </label>
                    <section className="flex flex-col h-1/3 w-1/2 m-auto gap-5">
                        <section className="flex gap-5 w-full">
                            <label
                                className="w-24 h-full text-lg font-semibold flex items-center"
                                htmlFor="userName"
                            >
                                UserName:
                            </label>
                            <input
                                onInput={() => {
                                    formik.setStatus("");
                                }}
                                value={formik.values.userName}
                                onChange={formik.handleChange}
                                className="p-1 w-full border border-stone-600 rounded"
                                type="text"
                                name="userName"
                                id="userName"
                            />
                        </section>
                        <Error
                            text={formik.errors.userName! || formik.status}
                            className="text-red-600 h-6 w-full"
                        ></Error>
                        <input
                            className="bg-blue-600 rounded text-white h-10 w-full cursor-pointer hover:bg-blue-500"
                            type="submit"
                            value="Add"
                        />
                    </section>
                </section>
            </form>
        </div>
    );
}

export default AddUser;
