import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Select from "@mui/material/Select";
import Avatar from "@mui/material/Avatar";
import TableRow from "@mui/material/TableRow";
import MenuItem from "@mui/material/MenuItem";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import IconButton from "@mui/material/IconButton";
import { styled, useTheme } from "@mui/material/styles";
import Edit from "@mui/icons-material/Edit";
import { Paragraph } from "app/components/Typography";

export default function TopSellingTable() {
  const { palette } = useTheme();
  const bgError = palette.error.main;
  const bgPrimary = palette.primary.main;
  const bgSecondary = palette.secondary.main;

  return (
    <Card elevation={3} sx={{ pt: "20px", mb: 3 }}>

    </Card>
  );
}