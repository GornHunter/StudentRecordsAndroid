import React, { useState, useCallback, useEffect } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";
import { ListItem } from "@rneui/themed";
import axios from "axios";
import { SelectList } from "react-native-dropdown-select-list";
import { getDrawerStatusFromState } from "@react-navigation/drawer";

export default function StudentSubject() {
  const [modalOpen, setModalOpen] = useState(false);
  const [actionTriggered, setActionTriggered] = useState("");

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState("");
  const [subjects, setSubjects] = useState("");

  const [categories, setCategories] = useState("");
  const [points, setPoints] = useState("");

  const [school_year, setSchoolYear] = useState("");

  const getStudents = async () => {
    try {
      const {
        data: { students },
      } = await axios.get(`${global.ipAddress}/students`);

      let items = students.map((item) => {
        return { key: item._id, value: `${item.firstName} ${item.lastName}` };
      });

      setStudents(items);
    } catch (error) {
      console.log(error);
    }
  };

  const getSubjectsAssign = async () => {
    try {
      const {
        data: { subjects },
      } = await axios.get(`${global.ipAddress}/subjects`);

      const {
        data: { studentSubject },
      } = await axios.get(
        `${global.ipAddress}/studentSubjects/${selectedStudent}&`
      );

      if (studentSubject.length !== 0) {
        for (let i = 0; i < studentSubject.length; i++) {
          for (let j = 0; j < subjects.length; j++) {
            if (subjects[j]._id !== "0") {
              if (subjects[j]._id === studentSubject[i].subject_id) {
                subjects[j]._id = "0";
              }
            }
          }
        }
      }

      let items = [];
      items.push({ key: "", value: "" });

      for (let i = 0; i < subjects.length; i++) {
        if (subjects[i]._id !== "0")
          items.push({ key: subjects[i]._id, value: subjects[i].name });
      }

      setSubjects(items);
    } catch (error) {
      console.log(error);
    }
  };

  const getSubjectsRemove = async () => {
    try {
      const {
        data: { studentSubject },
      } = await axios.get(
        `${global.ipAddress}/studentSubjects/${selectedStudent}&`
      );

      let items = [];

      items.push({ key: "", value: "" });
      for (let i = 0; i < studentSubject.length; i++) {
        const {
          data: { subject },
        } = await axios.get(
          `${global.ipAddress}/subjects/${studentSubject[i].subject_id}`
        );

        items.push({ key: subject._id, value: subject.name });
      }

      setSubjects(items);
    } catch (error) {
      console.log(error);
    }
  };

  const assignSubject = async () => {
    const student_id = selectedStudent;
    const subject_id = selectedSubject;

    try {
      await axios.post(`${global.ipAddress}/studentSubjects`, {
        student_id,
        subject_id,
        school_year,
      });
      getSubjectsAssign();

      setSelectedStudent("");
      setSchoolYear("");
      setSelectedSubject("");

      Alert.alert("Uspesno", "Predmet je uspesno dodeljen studentu.");
    } catch (error) {
      let msg = "";

      if (student_id === "")
        msg += error.response.data.msg.errors.student_id.message + "\n";

      if (school_year === "")
        msg += error.response.data.msg.errors.school_year.message + "\n";

      if (subject_id === "")
        msg += error.response.data.msg.errors.subject_id.message;

      Alert.alert("Greska", msg);
    }
  };

  const removeSubject = async () => {
    const student_id = selectedStudent;
    const subject_id = selectedSubject;

    try {
      if (student_id === "" || subject_id === "") {
        let msg = "";

        if (student_id === "") msg += "Student mora biti  odabran\n";

        if (subject_id === "") msg += "Predmet mora biti odabran";

        Alert.alert("Greska", msg);

        return;
      }

      await axios.delete(
        `${global.ipAddress}/studentSubjects/${selectedStudent}&${selectedSubject}`
      );
      getSubjectsRemove();

      Alert.alert("Uspesno", "Predmet je uspesno uklonjen.");
    } catch (error) {
      console.log(error);
    }
  };

  const getPoints = async () => {
    let subj = "";
    let studSubj = "";
    console.log(subject);
    if (selectedSubject !== "") {
      try {
        const {
          data: { subject },
        } = await axios.get(`${global.ipAddress}/subjects/${selectedSubject}`);
        subj = subject;

        const {
          data: { studentSubject },
        } = await axios.get(
          `${global.ipAddress}/studentSubjects/${selectedStudent}&${selectedSubject}`
        );
        studSubj = studentSubject[0];
      } catch (error) {
        console.timeLog(error);
      }
    }

    if (selectedSubject === "") {
      setCategories("");
      setPoints("");
    }

    let tmp = "";
    if (selectedSubject !== "") {
      if (subj.categories.length !== 0) {
        for (let i = 0; i < subj.categories.length; i++) {
          tmp += `${subj.categories[i]},`;
        }
        tmp = tmp.slice(0, -1);
        setCategories(tmp);
      }

      tmp = "";
      if (studSubj.points.length !== 0) {
        for (let i = 0; i < studSubj.points.length; i++) {
          tmp += `${studSubj.points[i]},`;
        }
        tmp = tmp.slice(0, -1);
        setPoints(tmp);
      }
    }
  };

  const assignPoints = async () => {
    const student_id = selectedStudent;
    const subject_id = selectedSubject;
    const num = points.split(",").length - 1;
    let p = [];

    if (num > 0) {
      for (let i = 0; i < num + 1; i++) p.push(Number(points.split(",")[i]));
    } else {
      if (points == "") p = [];
      else p = Number(points);
    }

    //setPoints(p);

    try {
      if (student_id === "" || subject_id === "") {
        let msg = "";

        if (student_id === "") msg += "Student mora biti  odabran\n";

        if (subject_id === "") msg += "Predmet mora biti odabran";

        Alert.alert("Greska", msg);

        return;
      }

      let points = p;
      const {
        data: { studentSubject },
      } = await axios.patch(
        `${global.ipAddress}/studentSubjects/${student_id}&${subject_id}`,
        {
          points,
        }
      );

      Alert.alert("Uspesno", "Poeni su uspesno dodati.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={modalOpen} animationType="slide">
        <View>
          <MaterialIcons
            name="close"
            size={28}
            onPress={() => {
              setModalOpen(false);
              setSelectedStudent("");
              setSelectedSubject("");
              setCategories("");
              setPoints("");
            }}
            style={styles.modalClose}
          />
          {actionTriggered === "ACTION_1" ? (
            <View>
              <Text
                style={{
                  marginLeft: 12,
                  marginTop: 10,
                  fontSize: 16,
                }}
              >
                Student
              </Text>
              <SelectList
                data={students}
                setSelected={setSelectedStudent}
                boxStyles={{ marginTop: 7, marginHorizontal: 10 }}
                onSelect={() => {
                  getSubjectsAssign();
                }}
              />

              <Text style={{ marginLeft: 12, marginTop: 25, fontSize: 16 }}>
                Skolska godina
              </Text>
              <TextInput
                style={styles.input}
                onChangeText={(school_year) => setSchoolYear(school_year)}
                value={school_year}
              />

              <Text
                style={{
                  marginLeft: 12,
                  marginTop: 25,
                  fontSize: 16,
                }}
              >
                Predmet
              </Text>
              <SelectList
                data={subjects}
                setSelected={setSelectedSubject}
                boxStyles={{ marginTop: 7, marginHorizontal: 10 }}
              />

              <View
                style={{ width: "60%", marginTop: 50, alignSelf: "center" }}
              >
                <Button
                  title="Dodeli predmet studentu"
                  onPress={assignSubject}
                />
              </View>
            </View>
          ) : actionTriggered === "ACTION_2" ? (
            <View>
              <Text
                style={{
                  marginLeft: 12,
                  marginTop: 10,
                  fontSize: 16,
                }}
              >
                Student
              </Text>
              <SelectList
                data={students}
                setSelected={setSelectedStudent}
                boxStyles={{ marginTop: 7, marginHorizontal: 10 }}
                onSelect={() => {
                  getSubjectsRemove();
                }}
              />

              <Text
                style={{
                  marginLeft: 12,
                  marginTop: 25,
                  fontSize: 16,
                }}
              >
                Predmet
              </Text>
              <SelectList
                data={subjects}
                setSelected={setSelectedSubject}
                boxStyles={{ marginTop: 7, marginHorizontal: 10 }}
              />

              <View
                style={{ width: "60%", marginTop: 50, alignSelf: "center" }}
              >
                <Button
                  title="Ukloni dodeljen predmet"
                  color="red"
                  onPress={removeSubject}
                />
              </View>
            </View>
          ) : actionTriggered === "ACTION_3" ? (
            <View>
              <Text
                style={{
                  marginLeft: 12,
                  marginTop: 10,
                  fontSize: 16,
                }}
              >
                Student
              </Text>
              <SelectList
                data={students}
                setSelected={setSelectedStudent}
                boxStyles={{ marginTop: 7, marginHorizontal: 10 }}
                onSelect={() => {
                  getSubjectsRemove();
                }}
              />

              <Text
                style={{
                  marginLeft: 12,
                  marginTop: 25,
                  fontSize: 16,
                }}
              >
                Predmet
              </Text>
              <SelectList
                data={subjects}
                setSelected={setSelectedSubject}
                boxStyles={{ marginTop: 7, marginHorizontal: 10 }}
                onSelect={getPoints}
              />

              <Text style={{ marginLeft: 12, marginTop: 25, fontSize: 16 }}>
                Kategorije
              </Text>
              <TextInput
                style={styles.input}
                onChangeText={(categories) => setCategories(categories)}
                value={categories}
                editable={false}
              />

              <Text style={{ marginLeft: 12, marginTop: 25, fontSize: 16 }}>
                Poeni
              </Text>
              <TextInput
                style={styles.input}
                onChangeText={(points) => setPoints(points)}
                value={points}
              />

              <View
                style={{ width: "40%", marginTop: 50, alignSelf: "center" }}
              >
                <Button title="Unesi poene" onPress={assignPoints} />
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <View style={{ width: "60%" }}>
        <Button
          title="Dodeli predmet studentu"
          color="green"
          onPress={() => {
            setModalOpen(true);
            setActionTriggered("ACTION_1");
            getStudents();
          }}
        />
      </View>
      <View style={{ width: "60%", marginTop: 30 }}>
        <Button
          title="Ukloni dodeljen predmet"
          color="green"
          onPress={() => {
            setModalOpen(true);
            setActionTriggered("ACTION_2");
            getStudents();
          }}
        />
      </View>
      <View style={{ width: "60%", marginTop: 30 }}>
        <Button
          title="Unos poena"
          color="green"
          onPress={() => {
            setModalOpen(true);
            setActionTriggered("ACTION_3");
            getStudents();
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
  input: {
    height: 40,
    marginLeft: 12,
    marginTop: 7,
    marginRight: 12,
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: "black",
    padding: 10,
    color: "black",
  },
});
