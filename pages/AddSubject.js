import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";
import axios from "axios";
import { Alert } from "react-native";

export default function AddSubject() {
  const [name, setName] = useState("");
  let [categories, setCategories] = useState("");

  const addSubject = async () => {
    let tmp = categories;
    categories = [];
    const num = tmp.split(",").length - 1;
    if (num > 0) {
      for (let i = 0; i < num + 1; i++) categories[i] = tmp.split(",")[i];
    } else {
      if (tmp === "") categories = [];
      else categories = tmp;
    }

    try {
      await axios.post(`${global.ipAddress}/subjects`, {
        name,
        categories,
      });

      setName("");
      setCategories("");
      global.subject = 1;

      Alert.alert("Uspesno", "Predmet je uspesno dodat.");
    } catch (error) {
      let msg = "";
      if (name === "")
        msg += error.response.data.msg.errors.name.message + "\n";

      Alert.alert("Greska", msg);
    }
  };

  return (
    <View>
      <Text style={{ marginLeft: 12, marginTop: 10, fontSize: 16 }}>
        Ime predmeta
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={(name) => setName(name)}
        value={name}
      />

      <Text style={{ marginLeft: 12, marginTop: 25, fontSize: 16 }}>
        Kategorije
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={(categories) => setCategories(categories)}
        value={categories}
      />

      <View style={{ width: "40%", marginTop: 40, alignSelf: "center" }}>
        <Button title="Dodaj predmet" onPress={addSubject} />
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
