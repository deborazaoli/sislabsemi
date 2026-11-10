import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./screens/HomeScreen";
import ReservaScreen from "./screens/ReservaScreen";
import CalendarioScreen from "./screens/CalendarioScreen";
import MinhasReservasScreen from "./screens/MinhasReservasScreen";
import RelatarProblemaScreen from "./screens/RelatarProblemaScreen";

import LoginUsuarioScreen from "./screens/LoginUsuarioScreen";
import CadastroUsuarioScreen from "./screens/CadastroUsuarioScreen";

import LoginScreen from "./screens/LoginScreen";
import AdminScreen from "./screens/AdminScreen";

import LaboratoriosScreen from "./screens/LaboratoriosScreen";
import SalasScreen from "./screens/SalasScreen";
import EquipamentosScreen from "./screens/EquipamentosScreen";
import RecursoFormScreen from "./screens/RecursoFormScreen";
import RelatoriosScreen from "./screens/RelatoriosScreen";
import PerfilScreen from "./screens/PerfilScreen";
import ProblemasAdminScreen from "./screens/ProblemasAdminScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      {/* Oculta horário, Wi-Fi, bateria e demais informações do celular */}
      {/*<StatusBar hidden />*/}

      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LoginUsuario"
          screenOptions={{
            headerShown: false
          }}
        >

          {/* PRIMEIRA TELA DO SISTEMA */}
          <Stack.Screen
            name="LoginUsuario"
            component={LoginUsuarioScreen}
          />

          {/* CADASTRO DE USUÁRIO */}
          <Stack.Screen
            name="CadastroUsuario"
            component={CadastroUsuarioScreen}
          />

          {/* HOME */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />

          {/* RESERVAS */}
          <Stack.Screen
            name="Reserva"
            component={ReservaScreen}
          />

          <Stack.Screen
            name="Calendario"
            component={CalendarioScreen}
          />

          <Stack.Screen
            name="MinhasReservas"
            component={MinhasReservasScreen}
          />

          <Stack.Screen
            name="RelatarProblema"
            component={RelatarProblemaScreen}
          />

          {/* LOGIN ADMINISTRATIVO */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          {/* ÁREA ADMINISTRATIVA */}
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
          />

          {/* RECURSOS */}
          <Stack.Screen
            name="Laboratorios"
            component={LaboratoriosScreen}
          />

          <Stack.Screen
            name="Salas"
            component={SalasScreen}
          />

          <Stack.Screen
            name="Equipamentos"
            component={EquipamentosScreen}
          />

          <Stack.Screen
            name="RecursoForm"
            component={RecursoFormScreen}
          />

          <Stack.Screen
            name="Relatorios"
            component={RelatoriosScreen}
          />

          <Stack.Screen
  name="ProblemasAdmin"
  component={ProblemasAdminScreen}
/>

          <Stack.Screen
            name="Perfil"
            component={PerfilScreen}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}