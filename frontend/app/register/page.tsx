"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password);
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Create account
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sign up to start tracking your tasks.
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            fullWidth
            helperText="Use at least 8 characters (recommended)."
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          Already have an account? <Link href="/login">Sign in</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

