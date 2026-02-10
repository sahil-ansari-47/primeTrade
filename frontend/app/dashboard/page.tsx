"use client";

import Link from "next/link";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardHomePage() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Welcome{user?.email ? `, ${user.email}` : ""}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Your tasks are just one click away.
        </Typography>
        <Button component={Link} href="/dashboard/tasks">
          Go to Tasks
        </Button>
      </Paper>
    </Box>
  );
}

