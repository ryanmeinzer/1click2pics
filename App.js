import React, {useState, useEffect} from 'react'
import {Button, Image, View, Platform} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

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

      // the below two console.logs return the same information
      // console.log('result:', result)
      // FileSystem.getInfoAsync(result.uri)
      //   .then(info => {console.log('FileSystem.getInfoAsync:', info)})
      
      // create app asset from local file
      const asset = await MediaLibrary.createAssetAsync(result.uri)

      // get asset's MediaLibrary uri and the asset's localUri
      // MediaLibrary.getAssetInfoAsync(asset)
      //   .then(info => {console.log('asset.uri:', asset.uri), console.log('asset.localUri:', info.localUri)})

      // the below doesn't work
      // setImage({localUri: asset.localUri})

      // setImage to the asset's uri
      setImage({localUri: asset.uri})

      // legacy v1.0.0 - setImage to the image's localUri, stored in OS' cache (soon automatically deleted)
      // setImage({localUri: result.uri})

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
      const asset2 = await MediaLibrary.createAssetAsync(result.uri)
      setImage2({localUri: asset2.uri})
    }
  }

  // get last asset (AppExpo places it first in the array, not the last)
  // MediaLibrary.getAssetsAsync()
  //   .then(info => {console.log('last asset:', info.assets[0].uri)})

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
