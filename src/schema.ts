import * as yup from 'yup'

export type User = {
    userName: string;
    password: string;
}

const userSchema = yup.object().shape({
    userName: yup.string().min(2,'Username too short').required('Username is required').trim(),
    password: yup.string().min(8, 'Password must have at least 8 characters').required('Password is required').trim()
})

export default userSchema;