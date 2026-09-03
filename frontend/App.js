import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import ReservaScreen from "./screens/ReservaScreen";
import CalendarioScreen from "./screens/CalendarioScreen";
import MinhasReservasScreen from "./screens/MinhasReservasScreen";
import LoginScreen from "./screens/LoginScreen";
import AdminScreen from "./screens/AdminScreen";
import LaboratoriosScreen from "./screens/LaboratoriosScreen";
import SalasScreen from "./screens/SalasScreen";
import EquipamentosScreen from "./screens/EquipamentosScreen";
import RecursoFormScreen from "./screens/RecursoFormScreen";
import RelatoriosScreen from "./screens/RelatoriosScreen";
import LogoutScreen from "./screens/LogoutScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
    headerShown: false
  }}
>

        
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="Reserva"
          component={ReservaScreen}
          options={{
            title: "Fazer Reserva"
          }}
        />

        <Stack.Screen
          name="Calendario"
          component={CalendarioScreen}
          options={{
            title: "Calendário"
          }}
        />

        <Stack.Screen
          name="Historico"
          component={MinhasReservasScreen}
          options={{
            title: "Minhas Reservas"
          }}
        />

        <Stack.Screen name="Logout" component={LogoutScreen}/>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Laboratorios" component={LaboratoriosScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Salas" component={SalasScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Equipamentos" component={EquipamentosScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RecursoForm" component={RecursoFormScreen} />
        <Stack.Screen name="Relatorios" component={RelatoriosScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}