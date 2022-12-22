import { StatusBar } from "expo-status-bar";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./pages/Home";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import StudentSubject from "./pages/StudentSubject";

const Drawer = createDrawerNavigator();

global.student = 0;
global.subject = 0;

global.ipAddress = "http://192.168.1.12:3000/api/v1";

export default function App() {
  return (
    <>
      <StatusBar />
      <NavigationContainer>
        <Drawer.Navigator initialRouteName="Home">
          <Drawer.Screen name="Glavna strana" component={Home} />
          <Drawer.Screen name="Studenti" component={Students} />
          <Drawer.Screen name="Predmeti" component={Subjects} />
          <Drawer.Screen
            name="Studenti i predmeti"
            component={StudentSubject}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </>
  );
}

/*const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ced6d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
})*/
