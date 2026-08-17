allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

// توحيد مستوى JVM بين مهام Java وKotlin في كل الحزم الفرعية
// (يصلح تعارض unity_ads_plugin التي تضبط Java 1.8 صراحة بينما
// يكون إصدار Kotlin الافتراضي أحدث).
// الضبط على مستوى المهام (وليس امتداد AGP) لتجنّب خواص AGP المُغلقة
// (finalized)، وداخل afterEvaluate ليتغلّب على إعدادات سكربت الحزمة.
subprojects {
    plugins.withId("com.android.library") {
        afterEvaluate {
            tasks.withType<JavaCompile>().configureEach {
                sourceCompatibility = JavaVersion.VERSION_17.toString()
                targetCompatibility = JavaVersion.VERSION_17.toString()
            }
        }
    }
    // توحيد jvmTarget لمهام Kotlin.
    tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>()
        .configureEach {
            compilerOptions {
                jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
            }
        }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
