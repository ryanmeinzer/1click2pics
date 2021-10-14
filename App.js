import React, {useState, useEffect} from 'react'
import {Button, Image, View, Platform} from 'react-native'
import * as ImagePicker from 'expo-image-picker'

export default function ImagePickerExample() {
  const [image, setImage] = useState(null)
  const [image2, setImage2] = useState(null)

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!')
        }
      }
    })()
  }, [])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.cancelled) {
      setImage({localUri: result.uri})
      // setImage(result.uri)
    }
  }

  const pickImage2 = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.cancelled) {
      setImage2({localUri: result.uri})
      // setImage2(result.uri)
    }
  }

  return (
    <>
      <View style={{flex: 1, marginTop: 50, marginHorizontal: 10, alignItems: 'center', justifyContent: 'center'}}>
        <Button title={image ? "Change pic #1 (example: ID)" : "Choose pic #1 (example: ID)"} onPress={pickImage} />
        {image && <Image source={{uri: image.localUri}} style={{width: '100%', height: '75%'}} />}
      </View>
      <View style={{flex: 1, marginBottom: 25, marginHorizontal: 10, alignItems: 'center', justifyContent: 'center'}}>
        <Button title={image ? "Change pic #2 (example: Vaccine Card)" : "Choose pic #2 (example: Vaccine Card)"} onPress={pickImage2} />
        {image2 && <Image source={{uri: image2.localUri}} style={{width: '100%', height: '75%'}} />}
      </View>
    </>
  )
}
