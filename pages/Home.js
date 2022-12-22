import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AddStudent from "./AddStudent";
import AddSubject from "./AddSubject";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [actionTriggered, setActionTriggered] = useState("");

  return (
    <View style={styles.container}>
      <Modal visible={modalOpen} animationType="slide">
        <View>
          <MaterialIcons
            name="close"
            size={28}
            onPress={() => setModalOpen(false)}
            style={styles.modalClose}
          />
          {actionTriggered === "ACTION_1" ? (
            <AddStudent />
          ) : actionTriggered === "ACTION_2" ? (
            <AddSubject />
          ) : null}
        </View>
      </Modal>

      <View style={{ width: "40%" }}>
        <Button
          title="Dodaj studenta"
          color="green"
          onPress={() => {
            setModalOpen(true);
            setActionTriggered("ACTION_1");
          }}
        />
      </View>
      <View style={{ width: "40%", marginTop: 30 }}>
        <Button
          title="Dodaj predmet"
          color="green"
          onPress={() => {
            setModalOpen(true);
            setActionTriggered("ACTION_2");
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ced6d2",
    alignItems: "center",
    justifyContent: "center",
  },
  modalClose: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "black",
    padding: 5,
    borderRadius: 10,
    alignSelf: "center",
  },
});
