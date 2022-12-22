import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  StatusBar,
  ScrollView,
  Modal,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { ListItem } from "@rneui/themed";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

export default function Subjects() {
  const [subjects, setSubjects] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionTriggered, setActionTriggered] = useState("");
  const [data, setData] = useState("");

  const [name, setName] = useState("");
  let [categories, setCategories] = useState("");

  const [key, setKey] = useState("");

  const getSubjects = async () => {
    try {
      const {
        data: { subjects },
      } = await axios.get(`${global.ipAddress}/subjects`);
      setSubjects(subjects);
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(() => {
    if (global.subject === 0 || global.subject === 1) {
      getSubjects();
      console.log("useFocusSubject: " + global.subject);
      global.subject = 2;
    } else {
      console.log("end_subject");
      return;
    }
  });

  const showInformation = async (key) => {
    let data = "";

    try {
      const {
        data: { subject },
      } = await axios.get(`${global.ipAddress}/subjects/${key}`);
      const { _id: subjectID, name, categories } = subject;

      if (categories.length === 0)
        data = `Predmet ${name} trenutno nema nijednu definisanu kategoriju.`;
      else {
        data = `Predmet ${name} ima sledece kategorije:\n\n`;
        categories.forEach((item) => (data += `\t\t- ${item}\n`));
      }
    } catch (error) {
      console.log(error);
    }

    setData(data);
  };

  const updateSubject = async () => {
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
      const {
        data: { subject },
      } = await axios.patch(`${global.ipAddress}/subjects/${key}`, {
        name,
        categories,
      });
      global.subject = 1;
      getSubjects();

      Alert.alert("Uspesno", "Predmet je uspesno azuriran.");
    } catch (error) {
      let msg = "";
      if (name === "")
        msg += error.response.data.msg.errors.name.message + "\n";

      Alert.alert("Greska", msg);
    }
  };

  const deleteSubject = async (id) => {
    try {
      await axios.delete(`${global.ipAddress}/studentSubjects/${id}&`);
      await axios.delete(`${global.ipAddress}/subjects/${id}`);
      global.subject = 1;
      getSubjects();
    } catch (error) {
      console.log(error);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    wait(10).then(() => {
      global.subject = 1;
      setRefreshing(false);
    });
  }, []);

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
          <ScrollView>
            {actionTriggered === "ACTION_1" ? (
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

                <View
                  style={{ width: "40%", marginTop: 40, alignSelf: "center" }}
                >
                  <Button title="Azuriraj predmet" onPress={updateSubject} />
                </View>
              </View>
            ) : actionTriggered === "ACTION_2" ? (
              <Text style={{ fontSize: 20 }}>{data}</Text>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
      {/*<Button title="Ucitaj predmete" color="green" onPress={getSubjects} />*/}
      {subjects && subjects.length > 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {subjects.map((subject) => (
            <ListItem.Swipeable
              key={subject._id}
              onPress={() => {
                setModalOpen(true),
                  setActionTriggered("ACTION_2"),
                  showInformation(subject._id);
              }}
              bottomDivider
              leftContent={() => (
                <Button
                  title="Azuriraj"
                  onPress={() => {
                    let tmp = subjects.find(
                      (s) => s._id === subject._id
                    ).categories;
                    let tmp1 = "";
                    for (let i = 0; i < tmp.length; i++) {
                      if (i === tmp.length - 1) tmp1 += tmp[i];
                      else tmp1 += tmp[i] + ",";
                    }
                    setCategories(tmp1);
                    setName(subjects.find((s) => s._id === subject._id).name);
                    setModalOpen(true),
                      setActionTriggered("ACTION_1"),
                      setKey(subject._id);
                  }}
                  color="blue"
                />
              )}
              rightContent={() => (
                <Button
                  title="Izbrisi"
                  onPress={() => {
                    deleteSubject(subject._id);
                  }}
                  color="red"
                />
              )}
            >
              <ListItem.Content>
                <ListItem.Title>{subject.name}</ListItem.Title>
              </ListItem.Content>
            </ListItem.Swipeable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ced6d2",
  },
  modalClose: {
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "black",
    padding: 5,
    borderRadius: 10,
    alignSelf: "center",
  },
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
