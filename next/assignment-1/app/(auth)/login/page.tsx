"use client";

import { useState } from "react";
import { 
    Container,
    Typography, 
    Button, 
    FormControl,
    FormLabel,
    Box,
    InputAdornment,
    IconButton,
    OutlinedInput,
    Paper,
    FormHelperText,
    Alert
} from "@mui/material";  
import {
    Visibility,
    VisibilityOff
} from "@mui/icons-material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";    
import { useDispatch } from "react-redux";
import { setError } from "@/store/slices/authSlice";

const logInSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password should be atleast 8 characters")
});

type LogInFormData = z.infer<typeof logInSchema>;


export default function LogIn() {
    const [showPassword, setShowPassword] = useState<boolean>(false); 
    const [displayErr, setDisplayErr] = useState<string>('');
    
    const router = useRouter();
    const dispatch = useDispatch();

    const {register, handleSubmit, formState: {errors, isSubmitting   }} = useForm<LogInFormData>({
        resolver: zodResolver(logInSchema)
    });


    const handleClickShowPassword = () => {
        setShowPassword((showPassword) => !showPassword);
    }

    // function sent post request with email and password data and after successfully login , redirect to dashboard
    const onSubmit: SubmitHandler<LogInFormData> = async (data, e: any) => {
        e.preventDefault();
        setDisplayErr("");
        const {email, password} = data;
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({email, password}),
            });
            if(!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Login failed');
            }
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error : any) {
            setDisplayErr(error.message);
            dispatch(setError(error.message));
        }
    }

  return (
    <Container className="min-h-screen flex items-center justify-center min-w-[340px] bg-gray-200!" component="main" >
        <Paper elevation={4} className=" p-10 md:min-w-[430px] space-y-4 flex flex-col gap-3 ">

                <Typography variant="h4" className="pb-3">Sign In</Typography>
                {displayErr && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{displayErr}</Alert>}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormControl>
                        {/* Email field */}
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <OutlinedInput 
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            {...register("email", {required: true})}
                            autoFocus
                            color={errors.email ? "error" : "primary"}
                        />
                        {
                            errors.email && 
                            (<FormHelperText id="email-error-msg" className=" text-red-300! text-wrap overflow-y-hidden max-h-[40px]"> {errors.email.message?.toString()} </FormHelperText>)
                        }
                    </FormControl>
                    <FormControl>
                        {/* Password field */}
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <OutlinedInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            color={errors.password ? "error" : "primary"}
                            {...register("password", {required: true})}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? "hide the password" : " show the password"} 
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff/> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                        {
                            errors.password && 
                            (<FormHelperText id="password-error-msg" className=" text-red-300! text-wrap overflow-y-hidden max-h-[40px]"> {errors.password.message?.toString()} </FormHelperText>)
                        }
                    </FormControl>
                    <Button 
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                    >{isSubmitting ? "Logging In..." :"Log In"}</Button>
                </form>
                <Box className="mt-2">
                    <Link href="/register" className="no-underline">
                        <Typography variant="body2" color="primary" align="center">
                            Don't have an Account? Register
                        </Typography>
                    </Link>
                </Box>
        </Paper>
    </Container>
  );
}