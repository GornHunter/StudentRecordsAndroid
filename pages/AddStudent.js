import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";
import axios from "axios";
import { Alert } from "react-native";

export default function AddStudent() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [index, setIndex] = useState("");

  const addStudent = async () => {
    try {
      await axios.post(`${global.ipAddress}/students`, {
        firstName,
        lastName,
        index,
      });

      setFirstName("");
      setLastName("");
      setIndex("");
      global.student = 1;

      Alert.alert("Uspesno", "Student je uspesno dodat.");
    } catch (error) {
      let msg = "";
      if (firstName === "")
        msg += error.response.data.msg.errors.firstName.message + "\n";

      if (lastName === "")
        msg += error.response.data.msg.errors.lastName.message + "\n";

      if (index === "")
        msg += error.response.data.msg.errors.index.message + "\n";

      if (index !== "" && error.response.data.msg.errors.index !== undefined)
        msg += error.response.data.msg.errors.index.message + "\n";

      Alert.alert("Greska", msg);
    }
  };

  return (
    <View>
      <Text style={{ marginLeft: 12, marginTop: 10, fontSize: 16 }}>Ime</Text>
      <TextInput
        style={styles.input}
        onChangeText={(firstName) => setFirstName(firstName)}
        value={firstName}
      />

      <Text style={{ marginLeft: 12, marginTop: 25, fontSize: 16 }}>
        Prezime
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={(lastName) => setLastName(lastName)}
        value={lastName}
      />

      <Text style={{ marginLeft: 12, marginTop: 25, fontSize: 16 }}>
        Broj indeksa
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={(index) => setIndex(index)}
        value={index}
      />

      <View style={{ width: "40%", marginTop: 40, alignSelf: "center" }}>
        <Button title="Dodaj studenta" onPress={addStudent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    marginLeft: 12,
    marginTop: 7,
    marginRight: 12,
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: "black",
    padding: 10,
  },
});
