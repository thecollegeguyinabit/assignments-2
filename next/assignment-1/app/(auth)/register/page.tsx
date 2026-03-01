"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { 
    Alert,
    Box,
    Button,
    Container, 
    FormControl, 
    FormHelperText, 
    FormLabel, 
    IconButton, 
    InputAdornment, 
    OutlinedInput, 
    Paper, 
    Typography 
} from "@mui/material";
import Link from "next/link";
import { SyntheticEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setError } from "@/store/slices/authSlice";
import { signInWithEmailAndPassword } from "firebase/auth";

const signUpSchema = z.object({
    email: z.email("Invalid address"),
    password: z.string().min(8,{ message: "Password must be atleast 8 character"}),
    confirmPassword: z.string().min(8,{ message: "Password must be atleast 8 character"})
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match",
    path: ["confirmPassword"]
});

type SignUpFormData = z.infer<typeof signUpSchema>

export default function Register() {
   
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [displayError, setDisplayErr] = useState<string>('');

    const router = useRouter();
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: {errors, isSubmitting}} = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        mode: "onChange" 
    });

    const handleClickShowPassword = () => {
        setShowPassword((showPassword) => !showPassword);
    }

    // function sent post request with email and password data and after successfully signup , redirect to dashboard
    const onSubmit = async (data: SignUpFormData, e: any) => {
        const { email, password} = data;
        e.preventDefault();
        setDisplayErr('');

        try {
            const response = await fetch('/api/auth/register',{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });
            if(!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Registration  failed");
            }

            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error: any) {
            setDisplayErr(error.message);
            dispatch(setError(error.message));
        }

    };
    
  return (
    <Container className="min-h-screen flex items-center justify-center min-w-[340px] bg-gray-200!">
        <Paper elevation={4} className=" p-10 md:min-w-[430px] space-y-4 flex flex-col gap-3 ">
                
                <Typography variant="h4" className="pb-3">Sign Up</Typography>
                {displayError && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{displayError}</Alert>}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormControl>
                        {/* Email field */}
                        <FormLabel htmlFor="email">Email *</FormLabel>
                        <OutlinedInput 
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            {...register("email", {required: true})}
                            color={errors.email ? "error" : "primary"}
                        />
                        {
                            errors.email && 
                            (<FormHelperText id="email-error-msg" className=" text-red-300! text-wrap overflow-y-hidden max-h-[40px]"> {errors.email.message?.toString()} </FormHelperText>)
                        }
                    </FormControl>
                    <FormControl>
                        {/* Password field */}
                        <FormLabel htmlFor="password">Password *</FormLabel>
                        <OutlinedInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            color={errors.password ? "error" : "primary"}
                            {...register("password", {required: true, })}
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
                    <FormControl>
                        {/* confirm password field */}
                        <FormLabel htmlFor="confirmPassword">Confirm Password *</FormLabel>
                        <OutlinedInput
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            color={errors.confirmPassword ? "error" : "primary"}
                            {...register("confirmPassword",{required: true})}
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
                            onInput={() => {}}
                            
                        />
                        {
                            errors.confirmPassword && 
                            (<FormHelperText id="password-error-msg" className=" text-red-500!  text-wrap overflow-y-hidden max-h-[40px]"> {errors.confirmPassword.message?.toString()} </FormHelperText>)
                        }
                    </FormControl>
                    <Button 
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                    >{isSubmitting ? "Signing Up..." :"Sign Up"}</Button>
                </form>
                <Box className="mt-2">
                    <Link href="/login" className="no-underline">
                        <Typography variant="body2" color="primary" align="center">
                            Already have an account? Login
                        </Typography>
                    </Link>
                </Box>
        </Paper>
    </Container>
  );
}