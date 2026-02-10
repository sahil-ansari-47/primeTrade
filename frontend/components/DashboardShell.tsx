"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 280;

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const selected = pathname === href;

  return (
    <ListItemButton component={Link} href={href} selected={selected}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleDrawer = () => setMobileOpen((v) => !v);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <List sx={{ px: 1 }}>
        <NavItem href="/dashboard" label="Dashboard" icon={<DashboardIcon />} />
        <NavItem href="/dashboard/tasks" label="Tasks" icon={<ChecklistIcon />} />
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider />
        <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "center" }}>
          <AccountCircleIcon color="action" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
              {user?.email || "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.id || ""}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            color="primary"
            variant="outlined"
            onClick={logout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="transparent"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255, 247, 237, 0.8)",
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ display: { md: "none" } }}
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src="/logo.jpg"
              alt="PrimeTrade AI logo"
              sx={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              PrimeTrade AI
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="dashboard navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              top: { xs: 56, sm: 64 },
              height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider",
              backgroundImage: "linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 70%)",
              top: 64,
              height: "calc(100% - 64px)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, md: 3 },
          pt: { xs: 10, md: 10 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

