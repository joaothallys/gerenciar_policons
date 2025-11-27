import { NavLink, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Formik } from "formik";
import * as Yup from "yup";
import useAuth from "app/hooks/useAuth";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { styled, useTheme } from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
// GLOBAL CUSTOM COMPONENTS
import MatxLogo from "app/components/MatxLogo";
import { Paragraph, Span } from "app/components/Typography";

const Logo = styled("div")({
  gap: 10,
  display: "flex",
  alignItems: "center",
  "& span": { fontSize: 26, lineHeight: 1.3, fontWeight: 800 },
});

const FirebaseRoot = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#1A2038",
  minHeight: "100vh !important",
  "& .card": { maxWidth: 800, margin: "1rem" },
  "& .cardLeft": {
    color: "#fff",
    height: "100%",
    display: "flex",
    padding: "32px 56px",
    flexDirection: "column",
    backgroundSize: "cover",
    background: "#161c37 url(/assets/images/bg-3.png) no-repeat",
    [theme.breakpoints.down("sm")]: { minWidth: 200 },
    "& img": { width: 32, height: 32 },
  },
  "& .mainTitle": {
    fontSize: 18,
    lineHeight: 1.3,
    marginBottom: 24,
  },
  "& .item": {
    position: "relative",
    marginBottom: 12,
    paddingLeft: 16,
    "&::after": {
      top: 8,
      left: 0,
      width: 4,
      height: 4,
      content: '""',
      borderRadius: 4,
      position: "absolute",
      backgroundColor: theme.palette.error.main,
    },
  },
}));

// Initial login credentials
const initialValues = {
  email: "",
  password: "",
  remember: true,
};

// Form field validation schema
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(1, "A senha deve ter ao menos 1 caracteres")
    .required("A senha é obrigatória!"),
  email: Yup.string().email("Invalid Email address").required("O e-mail é obrigatório"),
});

export default function FirebaseLogin() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuth();

  const handleFormSubmit = async (values, { setErrors }) => {
    try {
      await login(values.email, values.password);
      enqueueSnackbar("Login realizado com sucesso!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Erro ao fazer login: " + error.message, { variant: "error" });
      setErrors({ email: "Credenciais inválidas. Verifique e tente novamente." });
    }
  };

  return (
    <FirebaseRoot>
      <Card className="card">
        <Grid container>
          {/* Seção Esquerda */}
          <Grid item md={6} xs={12}>
            <div className="cardLeft">
              <Logo>
                <MatxLogo /> <span>Policoins</span>
              </Logo>

              <h1 className="mainTitle">Bem-vindo ao Sistema de Gerenciamento de Policoins</h1>

              <div className="features">
                <div className="item">Autenticação segura com tokens JWT</div>
                <div className="item">Gerenciamento completo de transações</div>
                <div className="item">Controle total de metas e produtos</div>
              </div>

              <Span flexGrow={1}></Span>

            </div>
          </Grid>

          {/* Seção Direita */}
          <Grid item md={6} xs={12}>
            <Box p={4}>
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
              >
                {({
                  values,
                  errors,
                  touched,
                  isSubmitting,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                }) => (
                  <form onSubmit={handleSubmit}>
                    {/* Campo de Email */}
                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      name="email"
                      label="E-mail"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.email}
                      onChange={handleChange}
                      helperText={touched.email && errors.email}
                      error={Boolean(errors.email && touched.email)}
                      sx={{ mb: 3 }}
                    />

                    {/* Campo de Senha */}
                    <TextField
                      fullWidth
                      size="small"
                      name="password"
                      type="password"
                      label="Senha"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.password}
                      onChange={handleChange}
                      helperText={touched.password && errors.password}
                      error={Boolean(errors.password && touched.password)}
                      sx={{ mb: 1.5 }}
                    />

                    {/* Link para Esqueceu a Senha */}
                    <Box display="flex" justifyContent="space-between">
                      <a
                        href="https://app-spa.poli.digital/login?force_login=true"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: theme.palette.primary.main }}
                      >
                        Esqueceu sua senha?
                      </a>
                    </Box>

                    {/* Botão de Login */}
                    <LoadingButton
                      type="submit"
                      color="primary"
                      loading={isSubmitting}
                      variant="contained"
                      sx={{ my: 2 }}
                    >
                      Login
                    </LoadingButton>

                    {/* Link para Suporte */}
                    <Paragraph>
                      Não tem uma conta?
                      <a
                        href="https://api.whatsapp.com/send?phone=55623626666"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          marginInlineStart: 5,
                          color: theme.palette.primary.main,
                        }}
                      >
                        Suporte
                      </a>
                    </Paragraph>
                  </form>
                )}
              </Formik>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </FirebaseRoot>
  );
}
