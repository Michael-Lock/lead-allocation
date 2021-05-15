import React, { Component } from 'react'

import { CSVReader } from 'react-papaparse'



export default class LocalFileReader extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buttonRef: React.createRef()
        }
    }    
    
  handleOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (this.state.buttonRef.current) {
      this.state.buttonRef.current.open(e)
    }
  }

  handleOnFileLoad = (data) => {
    return this.props.onFileLoad(data);
  }

  handleOnError = (err, file, inputElem, reason) => {
    console.log(err)
  }

  handleOnRemoveFile = (data) => {
    return this.props.onFileRemove();
  }

  handleRemoveFile = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (this.state.buttonRef.current) {
        this.state.buttonRef.current.removeFile(e)
    }
  }

  render() {
    return (
      <CSVReader
        ref={this.state.buttonRef ? this.state.buttonRef : null}
        onFileLoad={this.handleOnFileLoad}
        onError={this.handleOnError}
        noClick
        noDrag
        config={
            {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
            }
        }
        onRemoveFile={this.handleOnRemoveFile}
      >
        {({ file }) => (
          <aside
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginBottom: 10
            }}
          >
            <button
              type='button'
              onClick={this.handleOpenDialog}
              disabled={this.props.disabled}
              style={{
                borderRadius: 0,
                marginLeft: 0,
                marginRight: 0,
                width: '40%',
                paddingLeft: 0,
                paddingRight: 0
              }}
            >
              Browse file
            </button>
            <div
              style={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: '#ccc',
                height: 45,
                lineHeight: 2.5,
                marginTop: 5,
                marginBottom: 5,
                paddingLeft: 13,
                paddingTop: 3,
                width: '60%'
              }}
            >
              {file && file.name}
            </div>
            <button
              style={{
                borderRadius: 0,
                marginLeft: 0,
                marginRight: 0,
                paddingLeft: 20,
                paddingRight: 20
              }}
              onClick={this.handleRemoveFile}
            >
              Remove
            </button>
          </aside>
        )}
      </CSVReader>
    )
  }
}